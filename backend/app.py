"""
Vyapar AI — Flask REST API Server v2
Features: Caching, Rate Limiting, JWT Auth, Pagination, Vector Search, Security
"""
import os
import sys
import logging

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from supabase import create_client, Client
from config import Config
from services.recommendation import RecommendationService, get_current_season
from services.embedding import EmbeddingService
from services.analytics import AnalyticsService
from services.cache import recommendation_cache, catalog_cache, analytics_cache, CacheService
from services.auth import AuthService, require_auth, optional_auth

# ─── Logging Setup ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO if Config.FLASK_ENV == "production" else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("VyaparAI")

# ─── Initialize Flask App ───────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=Config.ALLOWED_ORIGINS)

# ─── Rate Limiter ───────────────────────────────────────────────
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[Config.RATE_LIMIT_DEFAULT],
    storage_uri="memory://",
)

# ─── Initialize Services ────────────────────────────────────────
Config.validate()

supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY) if Config.SUPABASE_URL else None
recommendation_service = RecommendationService() if Config.GEMINI_API_KEY else None
embedding_service = EmbeddingService() if Config.GEMINI_API_KEY else None
analytics_service = AnalyticsService(supabase) if supabase else None


# ─── Error Handlers ─────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found", "code": "NOT_FOUND"}), 404


@app.errorhandler(429)
def rate_limited(e):
    return jsonify({
        "error": "Rate limit exceeded. Please slow down.",
        "code": "RATE_LIMITED",
        "retry_after": e.description,
    }), 429


@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Internal error: {e}")
    return jsonify({"error": "Internal server error", "code": "SERVER_ERROR"}), 500


# ─── Health Check ────────────────────────────────────────────────
@app.route("/", methods=["GET"])
@limiter.exempt
def health():
    """API health check with cache stats."""
    return jsonify({
        "status": "✅ Vyapar AI API is running",
        "season": get_current_season(),
        "version": "2.0.0",
        "features": {
            "caching": "✅ In-memory TTL",
            "rate_limiting": "✅ Active",
            "jwt_auth": "✅ Available",
            "pagination": "✅ Enabled",
            "vector_search": "✅ pgvector",
        },
        "cache_stats": {
            "recommendations": recommendation_cache.stats(),
            "catalog": catalog_cache.stats(),
            "analytics": analytics_cache.stats(),
        },
        "endpoints": [
            "POST /api/recommend",
            "POST /api/auth/token",
            "POST /api/event",
            "GET  /api/social-proof",
            "GET  /api/analytics",
            "GET  /api/catalog",
            "POST /api/chat",
        ],
    })


# ─── POST /api/auth/token ──────────────────────────────────────
@app.route("/api/auth/token", methods=["POST"])
@limiter.limit("20/hour")
def get_auth_token():
    """Generate a JWT token for a user."""
    try:
        data = request.get_json() or {}
        email = data.get("email", "")
        role = data.get("role", "customer")

        if not email:
            return jsonify({"error": "Email is required"}), 400

        # Look up or create user
        user_id = None
        if supabase:
            try:
                result = supabase.table("users").select("id, role").eq("email", email).limit(1).execute()
                if result.data:
                    user_id = result.data[0]["id"]
                    role = result.data[0]["role"]
                else:
                    # Create user
                    result = supabase.table("users").insert({
                        "email": email,
                        "name": email.split("@")[0],
                        "role": role,
                    }).execute()
                    user_id = result.data[0]["id"] if result.data else "anonymous"
            except Exception as e:
                logger.warning(f"User lookup failed: {e}")
                user_id = "anonymous"
        else:
            user_id = "anonymous"

        token = AuthService.generate_token(user_id, role)
        return jsonify({
            "token": token,
            "user_id": user_id,
            "role": role,
            "expires_in": Config.JWT_EXPIRY_HOURS * 3600,
        }), 200

    except Exception as e:
        logger.error(f"Auth error: {e}")
        return jsonify({"error": "Authentication failed"}), 500


# ─── POST /api/recommend ────────────────────────────────────────
@app.route("/api/recommend", methods=["POST"])
@limiter.limit(Config.RATE_LIMIT_RECOMMEND)
@optional_auth
def recommend():
    """
    AI Recommendation Endpoint with caching.
    Returns cached results if same query+mood was recently processed.
    """
    try:
        data = request.get_json() or {}
        query = data.get("query", "").strip()
        mood = data.get("mood", "Comfort")
        preferences = data.get("preferences", {})

        # Input validation
        if not query:
            return jsonify({"error": "Query is required", "code": "VALIDATION_ERROR"}), 400
        if mood not in ("Adventurous", "Romantic", "Budget", "Comfort"):
            mood = "Comfort"
        if len(query) > 500:
            return jsonify({"error": "Query too long (max 500 chars)", "code": "VALIDATION_ERROR"}), 400

        # Check cache first
        cache_key = recommendation_cache._make_key(query.lower(), mood)
        cached = recommendation_cache.get(cache_key)
        if cached:
            logger.info(f"Cache HIT for: '{query[:40]}' [{mood}]")
            cached["_cached"] = True
            return jsonify(cached), 200

        logger.info(f"Cache MISS for: '{query[:40]}' [{mood}] — calling AI...")

        # Step 1: Generate embedding & vector search
        catalog_items = []
        if embedding_service and supabase:
            query_embedding = embedding_service.get_embedding(query)

            # pgvector similarity search
            try:
                result = supabase.rpc(
                    "match_catalog",
                    {
                        "query_embedding": query_embedding,
                        "match_threshold": 0.25,
                        "match_count": 15,
                    },
                ).execute()
                catalog_items = result.data if result.data else []
                logger.info(f"Vector search returned {len(catalog_items)} items")
            except Exception as e:
                logger.warning(f"Vector search fallback: {e}")
                try:
                    result = supabase.table("catalog").select("*").eq("is_active", True).limit(15).execute()
                    catalog_items = result.data if result.data else []
                except Exception:
                    pass

        elif supabase:
            try:
                result = supabase.table("catalog").select("*").eq("is_active", True).limit(15).execute()
                catalog_items = result.data if result.data else []
            except Exception:
                pass

        # Step 2: Get AI recommendations
        if recommendation_service:
            result = recommendation_service.get_recommendations(
                query=query,
                mood=mood,
                catalog_items=catalog_items,
                user_preferences=preferences,
            )
        else:
            result = {
                "recommendations": [],
                "bundles": [],
                "chat_response": "AI service is not configured.",
                "season": get_current_season(),
                "mood": mood,
            }

        # Step 3: Cache the result
        recommendation_cache.set(cache_key, result)

        # Step 4: Track search event (non-blocking)
        user_id = getattr(request, "auth_user", {})
        if analytics_service and user_id:
            try:
                analytics_service.track_event({
                    "user_id": user_id.get("user_id") if isinstance(user_id, dict) else None,
                    "event_type": "search",
                    "metadata": {"query": query, "mood": mood, "season": get_current_season()},
                })
            except Exception:
                pass

        result["_cached"] = False
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        return jsonify({
            "error": "Recommendation service encountered an error",
            "code": "RECOMMEND_ERROR",
            "recommendations": [],
            "bundles": [],
            "chat_response": "Something went wrong. Please try again.",
        }), 500


# ─── POST /api/event ─────────────────────────────────────────────
@app.route("/api/event", methods=["POST"])
@limiter.limit("200/hour")
def track_event():
    """Track user behavior event with validation."""
    try:
        data = request.get_json() or {}

        event_type = data.get("event_type", "")
        valid_types = {"view", "click", "purchase", "bundle_click", "search", "voice_search", "mood_select", "share"}

        if not event_type:
            return jsonify({"error": "event_type is required", "code": "VALIDATION_ERROR"}), 400
        if event_type not in valid_types:
            return jsonify({"error": f"Invalid event_type. Must be one of: {', '.join(sorted(valid_types))}", "code": "VALIDATION_ERROR"}), 400

        if analytics_service:
            result = analytics_service.track_event(data)
            return jsonify(result), 200 if result.get("success") else 500
        else:
            return jsonify({"success": True, "message": "Event tracking not configured"}), 200

    except Exception as e:
        logger.error(f"Event tracking error: {e}")
        return jsonify({"error": str(e), "code": "EVENT_ERROR"}), 500


# ─── GET /api/social-proof ───────────────────────────────────────
@app.route("/api/social-proof", methods=["GET"])
def social_proof():
    """Get real-time social proof data."""
    try:
        ids_param = request.args.get("ids", "")
        catalog_ids = [cid.strip() for cid in ids_param.split(",") if cid.strip()] if ids_param else None

        if analytics_service:
            data = analytics_service.get_social_proof(catalog_ids)
            return jsonify({"social_proof": data}), 200
        else:
            return jsonify({"social_proof": []}), 200

    except Exception as e:
        logger.error(f"Social proof error: {e}")
        return jsonify({"error": str(e), "code": "SOCIAL_PROOF_ERROR"}), 500


# ─── GET /api/analytics ─────────────────────────────────────────
@app.route("/api/analytics", methods=["GET"])
@optional_auth
def analytics():
    """Get analytics dashboard with caching."""
    try:
        days = min(int(request.args.get("days", 7)), 90)
        owner_id = request.args.get("owner_id")

        # Check cache
        cache_key = analytics_cache._make_key("analytics", days, owner_id)
        cached = analytics_cache.get(cache_key)
        if cached:
            return jsonify(cached), 200

        if analytics_service:
            data = analytics_service.get_analytics(owner_id=owner_id, days=days)
            analytics_cache.set(cache_key, data)
            return jsonify(data), 200
        else:
            return jsonify({
                "summary": {"total_events": 0, "total_views": 0, "total_clicks": 0, "total_purchases": 0},
                "timeline": [], "top_items": [], "hourly_activity": [],
            }), 200

    except Exception as e:
        logger.error(f"Analytics error: {e}")
        return jsonify({"error": str(e), "code": "ANALYTICS_ERROR"}), 500


# ─── GET /api/catalog (with pagination) ──────────────────────────
@app.route("/api/catalog", methods=["GET"])
def get_catalog():
    """
    Get catalog items with pagination, filtering, and caching.

    Query params:
    - page: page number (default 1)
    - per_page: items per page (default 20, max 100)
    - category, mood, season, search: filters
    """
    try:
        page = max(int(request.args.get("page", 1)), 1)
        per_page = min(int(request.args.get("per_page", Config.DEFAULT_PAGE_SIZE)), Config.MAX_PAGE_SIZE)
        category = request.args.get("category")
        mood = request.args.get("mood")
        season = request.args.get("season", get_current_season())
        search = request.args.get("search")

        # Check cache
        cache_key = catalog_cache._make_key("catalog", page, per_page, category, mood, season, search)
        cached = catalog_cache.get(cache_key)
        if cached:
            return jsonify(cached), 200

        if not supabase:
            return jsonify({"catalog": [], "total": 0, "page": page, "per_page": per_page, "total_pages": 0}), 200

        # Build query
        select_fields = (
            "id, name, description, category, subcategory, price, price_range, "
            "rating, review_count, location, address, image_url, tags, mood_tags, "
            "season_tags, cuisine_type, ambiance"
        )
        query = supabase.table("catalog").select(select_fields, count="exact").eq("is_active", True)

        if category:
            query = query.eq("category", category)
        if mood:
            query = query.contains("mood_tags", [mood])
        if search:
            query = query.ilike("name", f"%{search}%")

        # Pagination offset
        offset = (page - 1) * per_page
        result = query.range(offset, offset + per_page - 1).execute()

        total = result.count if result.count is not None else len(result.data)
        total_pages = max((total + per_page - 1) // per_page, 1)

        response = {
            "catalog": result.data,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

        catalog_cache.set(cache_key, response)
        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Catalog error: {e}")
        return jsonify({"error": str(e), "code": "CATALOG_ERROR"}), 500


# ─── POST /api/chat ──────────────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
@limiter.limit(Config.RATE_LIMIT_CHAT)
@optional_auth
def chat():
    """AI Chat with input validation."""
    try:
        data = request.get_json() or {}
        message = data.get("message", "").strip()
        context = data.get("context", {})

        if not message:
            return jsonify({"error": "Message is required", "code": "VALIDATION_ERROR"}), 400
        if len(message) > 1000:
            return jsonify({"error": "Message too long (max 1000 chars)", "code": "VALIDATION_ERROR"}), 400

        if recommendation_service:
            response = recommendation_service.generate_chat_response(message, context)
            return jsonify({"response": response}), 200
        else:
            return jsonify({"response": "AI chat is not configured."}), 200

    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({"error": str(e), "code": "CHAT_ERROR"}), 500


# ─── POST /api/scan-product ──────────────────────────────────
@app.route("/api/scan-product", methods=["POST"])
@limiter.limit("20/hour")
@optional_auth
def scan_product():
    """Scan a product image and get sourcing recommendations."""
    try:
        image_base64 = None
        user_location = None

        # Support multipart/form-data uploads AND JSON base64
        if request.content_type and 'multipart' in request.content_type:
            import base64
            file = request.files.get('image')
            if not file:
                return jsonify({"error": "No image file uploaded", "code": "VALIDATION_ERROR"}), 400
            raw_bytes = file.read()
            image_base64 = base64.b64encode(raw_bytes).decode('utf-8')
            user_location = request.form.get('location')
        else:
            data = request.get_json() or {}
            image_base64 = data.get("image", "")
            user_location = data.get("location")
            if not image_base64:
                return jsonify({"error": "Image data is required (base64)", "code": "VALIDATION_ERROR"}), 400
            if "base64," in image_base64:
                image_base64 = image_base64.split("base64,")[1]

        if recommendation_service:
            result = recommendation_service.analyze_product_image(image_base64, user_location)
            # Map wholesale_sources -> sources for frontend compatibility
            if 'wholesale_sources' in result and 'sources' not in result:
                result['sources'] = [
                    {
                        'name': s.get('name', s.get('source_type', '')),
                        'location': s.get('source_type', ''),
                        'price': s.get('estimated_price', 'N/A'),
                        'unit': s.get('tip', ''),
                    }
                    for s in result['wholesale_sources']
                ]
            if 'quality_tips' in result:
                result['tips'] = result['quality_tips']
            return jsonify(result), 200
        else:
            return jsonify({"error": "AI service not configured", "code": "SERVICE_ERROR"}), 503

    except Exception as e:
        logger.error(f"Product scan error: {e}")
        return jsonify({"error": str(e), "code": "SCAN_ERROR"}), 500


# ─── Cache admin ─────────────────────────────────────────────────
@app.route("/api/admin/cache/clear", methods=["POST"])
@require_auth
def clear_cache():
    """Clear all caches (requires auth with business_owner role)."""
    user = getattr(request, "auth_user", {})
    if user.get("role") != "business_owner":
        return jsonify({"error": "Admin access required"}), 403

    recommendation_cache.clear()
    catalog_cache.clear()
    analytics_cache.clear()
    return jsonify({"message": "All caches cleared"}), 200


# ─── Run Server ─────────────────────────────────────────────────
if __name__ == "__main__":
    port = Config.PORT
    print(f"""
======================================================
   Vyapar AI API Server v2.0                       
   http://localhost:{port}                           
   Season: {get_current_season():<39}
   Gemini: {' Connected' if Config.GEMINI_API_KEY else ' Missing':<33}
   Supabase: {' Connected' if Config.SUPABASE_URL else ' Missing':<31}
   JWT Auth:  Enabled                            
   Rate Limits:  Active                          
   Cache:  In-Memory TTL                         
   Pagination:  Enabled                           
======================================================
    """)
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
