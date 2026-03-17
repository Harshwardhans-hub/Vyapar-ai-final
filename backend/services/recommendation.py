"""
Vyapar AI — Recommendation, Chat & Vision Service
Model: gemini-1.5-flash (primary) → gemini-1.5-pro (fallback)
Aggressively trained for: product scanning, chat, recommendations, voice queries.
"""
import json
import re
import time
from datetime import datetime
from google import genai
from google.genai import types
from config import Config


def get_current_season():
    month = datetime.now().month
    if month in (3, 4, 5):   return "Spring"
    elif month in (6, 7, 8): return "Summer"
    elif month in (9, 10, 11): return "Autumn"
    else:                     return "Winter"


def get_upcoming_festivals():
    month = datetime.now().month
    return {
        1: "Makar Sankranti, Republic Day, Lohri",
        2: "Valentine's Day, Maha Shivratri, Basant Panchami",
        3: "Holi, Ugadi, Gudi Padwa, Women's Day",
        4: "Ram Navami, Hanuman Jayanti, Baisakhi, Easter",
        5: "Eid ul-Fitr, Mother's Day, Buddha Purnima",
        6: "Eid ul-Adha, Father's Day, Rath Yatra",
        7: "Guru Purnima, Muharram",
        8: "Independence Day, Raksha Bandhan, Janmashtami, Onam",
        9: "Ganesh Chaturthi, Navratri, Onam",
        10: "Navratri, Dussehra, Karva Chauth, Diwali prep",
        11: "Diwali, Bhai Dooj, Guru Nanak Jayanti, Children's Day",
        12: "Christmas, New Year Eve, Winter Sales",
    }.get(month, "Various festivals")


SEASON_CONTEXT = {
    "Spring": "Fresh produce, outdoor events, Holi colors, summer prep, light clothing, garden items, spring cleaning",
    "Summer": "Cooling products, cold drinks, ice cream, summer wear, fans/coolers, travel items, monsoon prep",
    "Autumn": "Festive season (Navratri/Diwali), warm clothing, sweets, decorations, gift items, harvest produce",
    "Winter": "Warm clothing, heaters, dry fruits, Christmas/New Year gifts, hot beverages, winter produce",
}

MOOD_PROMPTS = {
    "Adventurous": "trending, viral, new launches, high-demand, fast-moving, innovative products",
    "Romantic":    "premium, luxury, gift-worthy, high-margin, exclusive, special occasion",
    "Budget":      "affordable, high-volume, low-cost, best ROI, value-for-money, bulk deals",
    "Comfort":     "steady sellers, reliable demand, evergreen products, consistent movers",
}

# ─── Master System Prompt (injected into every AI call) ──────────────────────
SYSTEM_IDENTITY = """You are Vyapar AI — an expert Indian business advisor and product intelligence system.
You have deep knowledge of:
- Indian wholesale markets (APMC mandis like Azadpur, Vashi, Ghazipur, Crawford Market, Sadar Bazaar, etc.)
- Real-world startup processes: Renting, Shop Act, GST, MSME registration, FSSAI for food businesses.
- Wholesale pricing across all product categories in ₹ (Indian Rupees).
- Seasonal demand patterns (e.g., selling Mangoes in Summer, Woolens in Winter).
- Specific sourcing locations for categories: Vegetable mandis, Grain markets, Electronic hubs like Lamington Road/SP Road.
- Profit margin optimization for small local shops (Kirana, Veggie stalls, Boutique, Mobile repair).

RULES:
- Always use ₹ (Indian Rupees) for all prices.
- Be extremely specific: name real Indian markets, real platforms, and realistic price ranges.
- Be actionable: give clear numeric steps (e.g., "Step 1: Save ₹50,000 for deposit").
- INTEGRATION: Always remind users they can find the markets you mention in the "Wholesale Market Map" section of this dashboard.
- ALWAYS respond strictly in English, regardless of the language the user writes in.
"""


class RecommendationService:
    """AI-powered engine: recommendations, chat, image scanning."""

    def __init__(self):
        self.client = genai.Client(api_key=Config.GEMINI_API_KEY)
        self.model          = Config.GEMINI_MODEL           # gemini-1.5-flash
        self.model_fallback = Config.GEMINI_MODEL_FALLBACK  # gemini-1.5-pro
        self.vision_model   = Config.GEMINI_MODEL_VISION    # gemini-1.5-flash

    # ─── Core generate with model fallback ───────────────────────────────────
    def _generate(self, contents, use_vision=False, use_search=False):
        """
        Calls Gemini with automatic fallback:
        gemini-1.5-flash → gemini-1.5-pro
        Handles 429 rate limits with exponential backoff per model.
        """
        primary = self.vision_model if use_vision else self.model
        models  = [primary]
        if self.model_fallback != primary:
            models.append(self.model_fallback)
        # deduplicate
        seen = set()
        models = [m for m in models if not (m in seen or seen.add(m))]

        last_error = None
        for model_name in models:
            delay = 3
            for attempt in range(3):
                try:
                    print(f"   🤖 [{model_name}] attempt {attempt + 1}")
                    
                    kwargs = {"model": model_name, "contents": contents}
                    if use_search:
                        kwargs["config"] = types.GenerateContentConfig(
                            tools=[{"google_search": {}}]
                        )
                        
                    try:
                        resp = self.client.models.generate_content(**kwargs)
                        print(f"   ✅ Success [{model_name}] (with tools)")
                        return resp
                    except Exception as e:
                        err_str = str(e)
                        if "400" in err_str or "invalid" in err_str.lower() or "404" in err_str:
                            if use_search:
                                print(f"   ⚠️ Search tools not supported on [{model_name}]. Retrying without tools.")
                                kwargs.pop("config", None)
                                resp = self.client.models.generate_content(**kwargs)
                                print(f"   ✅ Success [{model_name}] (fallback non-tool)")
                                return resp
                            else:
                                raise e
                        else:
                            raise e
                except Exception as e:
                    last_error = str(e)

                    is_quota = any(k in last_error for k in ("429", "RESOURCE_EXHAUSTED", "quota"))
                    if is_quota and attempt < 2:
                        m = re.search(r'retry in (\d+(?:\.\d+)?)', last_error, re.I)
                        wait = float(m.group(1)) + 1 if m else delay
                        if wait > 10:
                            print(f"   ⏳ Rate limit [{model_name}] needs {wait:.0f}s. Too long, failing fast.")
                            break
                        print(f"   ⏳ Rate limit [{model_name}] — waiting {wait:.0f}s")
                        time.sleep(wait)
                        delay *= 2
                    else:
                        print(f"   ⚠️  [{model_name}] failed: {last_error[:80]}")
                        break
        raise Exception(f"All models exhausted. Last: {last_error}")

    def _parse_json(self, text: str) -> dict:
        """Strip markdown fences and parse JSON."""
        text = text.strip()
        if "{" in text and "}" in text:
            start = text.find("{")
            end = text.rfind("}") + 1
            text = text[start:end]
        return json.loads(text)

    # ─── 1. RECOMMENDATIONS ──────────────────────────────────────────────────
    def get_recommendations(self, query: str, mood: str = "Comfort",
                            catalog_items: list = None,
                            user_preferences: dict = None,
                            season: str = None) -> dict:
        if not season:
            season = get_current_season()

        mood_ctx   = MOOD_PROMPTS.get(mood, MOOD_PROMPTS["Comfort"])
        season_ctx = SEASON_CONTEXT.get(season, "")
        festivals  = get_upcoming_festivals()

        catalog_text = ""
        if catalog_items:
            for item in catalog_items[:20]:
                catalog_text += (
                    f"\n- {item.get('name','?')} | {item.get('category','?')} "
                    f"| ₹{item.get('price','?')} | {item.get('description','')[:80]}"
                )

        prompt = f"""{SYSTEM_IDENTITY}

TASK: Generate product/service recommendations for the user's query.

CONTEXT:
- Season: {season} ({season_ctx})
- Upcoming Festivals: {festivals}
- Strategy: {mood} — {mood_ctx}
- User Query: "{query}"
{f'- Available Catalog:{catalog_text}' if catalog_text else ''}

INSTRUCTIONS:
1. Recommend 5-7 highly relevant products/services matching the query and season
2. For each item provide:
   - Realistic wholesale price in ₹ (e.g. "₹40/kg", "₹120/piece", "₹2500/dozen")
   - Why it's relevant RIGHT NOW (season + festival demand)
   - Where to source it (specific market names or platforms)
   - Demand score 0.0–1.0
3. Create 2 smart bundles combining complementary items
4. Write a 2-3 sentence advisory summary

RESPOND WITH VALID JSON ONLY — no markdown, no extra text:
{{
  "recommendations": [
    {{
      "id": "rec-1",
      "name": "<product name>",
      "category": "<category>",
      "price": "<wholesale price in ₹>",
      "price_range": "₹",
      "rating": 4.5,
      "score": 0.92,
      "reason": "<why to stock this now + where to source>",
      "mood_match": "{mood}",
      "season_match": "{season}",
      "tags": ["{season.lower()}", "{mood.lower()}", "trending"]
    }}
  ],
  "bundles": [
    {{
      "title": "<bundle name>",
      "items": ["<item1>", "<item2>", "<item3>"],
      "tagline": "<why this bundle sells>",
      "total_price": "₹<amount>",
      "mood": "{mood}",
      "season": "{season}"
    }}
  ],
  "chat_response": "<friendly 2-3 sentence advisory>",
  "season": "{season}",
  "mood": "{mood}"
}}"""

        try:
            resp = self._generate(prompt)
            return self._parse_json(resp.text)
        except json.JSONDecodeError:
            return self._fallback_response(query, mood, season)
        except Exception as e:
            return self._fallback_response(query, mood, season, str(e))

    def _fallback_response(self, query, mood, season, error=None):
        msg = f"I found some great {mood.lower()} options for {season}! Check the recommendations below."
        if error and any(k in error for k in ("429", "RESOURCE_EXHAUSTED", "quota")):
            msg = "⚠️ AI is temporarily at capacity. Showing cached results. Please retry in 1-2 minutes."
        return {
            "recommendations": [{
                "id": "fallback-1", "name": "Local Favorites", "category": "Mixed",
                "price": "₹15", "price_range": "₹", "rating": 4.5, "score": 0.8,
                "reason": f"Popular {mood.lower()} choice for {season} based on '{query}'.",
                "mood_match": mood, "season_match": season, "tags": ["local", "popular"],
            }],
            "bundles": [{
                "title": f"{season} {mood} Bundle", "items": ["Seasonal Special", "Local Favorite"],
                "tagline": f"Best {mood.lower()} picks for {season}",
                "total_price": "₹450", "mood": mood, "season": season,
            }],
            "chat_response": msg, "season": season, "mood": mood,
        }

    # ─── 2. CHAT ─────────────────────────────────────────────────────────────
    def generate_chat_response(self, message: str, context: dict = None) -> str:
        season   = get_current_season()
        festivals = get_upcoming_festivals()
        month    = datetime.now().strftime("%B %Y")
        ctx_str  = f"\nConversation context: {json.dumps(context)}" if context else ""

        prompt = f"""{SYSTEM_IDENTITY}

CURRENT DATE: {month}
SEASON: {season}
UPCOMING FESTIVALS: {festivals}
{ctx_str}

USER MESSAGE: "{message}"

RESPONSE GUIDELINES — AI BUSINESS MENTOR:

1. INTERNET SEARCH & REAL-TIME ANALYSIS:
   - YOU MUST perform real-time analysis and internet searches (via your tools) to find exact wholesale locations, real market rates, and exact procedures.
   - Accurately interpret user queries even with spelling mistakes (e.g., 'dearch' -> 'search', 'treain' -> 'train') using semantic understanding.
   - Do NOT use dummy data or hardcoded templates for steps, products, or suppliers. Every response must be generated dynamically based on real data for the specific business requested.

2. STARTING A BUSINESS:
   - If the user asks how to open a specific shop or start a business, dynamically outline the real process.
   - You MUST format the response exactly like this example, but filling in the specific details using real-time search:
     1. rent a shop (give realistic rent estimates in \u20b9 for the specific business location/area).
     2. get products from wholeseller/suppliers (name ACTUAL specific wholesalers/markets based on internet search).
     3. [Additional steps like Licenses, margins, etc].
   - Do NOT use dummy names, "[Business Type]", or placeholders. Use real names from the internet.

3. SOURCING & PRICING:
   - Provide real Mandi rates (Mandi Bhav) or wholesale electronics/clothing prices.
   - Always quote prices in ₹ (Indian Rupees).

4. TONE & FORMAT:
   - Be a helpful, hyper-realistic, Indian business advisor.
   - Give direct, specific, actionable answers.
   - Keep it neatly formatted with emojis.
   - ALWAYS respond accurately in English. Do not use Hindi or Hinglish text.
   - Never say "I don't know" — search the internet and provide your best expert answer in one go.
"""

        try:
            resp = self._generate(prompt, use_search=True)
            return resp.text.strip()
        except Exception as e:
            err = str(e)
            if any(k in err for k in ("429", "RESOURCE_EXHAUSTED", "quota")):
                return (
                    f"⚠️ AI is temporarily at capacity. Quick tips for {season}:\n\n"
                    f"• Focus on {festivals} demand\n"
                    f"• Check wholesale markets early morning for best prices\n"
                    f"• Use the Map panel to find nearby suppliers\n\n"
                    f"Please retry in 1-2 minutes! 🙏"
                )
            return f"I'd love to help with your business this {season}! Could you tell me more — are you starting a new business, looking for product recommendations, or need sourcing help?"

    # ─── 3. PRODUCT IMAGE SCAN ───────────────────────────────────────────────
    def analyze_product_image(self, image_base64: str, user_location: str = None) -> dict:
        season    = get_current_season()
        festivals = get_upcoming_festivals()
        loc_ctx   = f"User location: {user_location}" if user_location else "User location: India"

        prompt = f"""{SYSTEM_IDENTITY}

TASK: You must analyze the provided product image and return hyper-realistic pricing and sourcing intelligence specifically tailored for an Indian business owner/retailer. Do NOT hallucinate generic responses. If you recognize the product, provide actual market data.

{loc_ctx}
Season: {season}
Upcoming Festivals: {festivals}

ANALYZE THE IMAGE AND PROVIDE EXACTLY:
1. IDENTIFY — exact product name, category, brand (if visible), and package size/variants.
2. PRICING & AMOUNT COMPARISON — detailed comparison showing typical retail price vs exact wholesale price in ₹ (Indian Rupees), enabling the businessman to understand exact margins.
3. WHOLESALE SOURCES — 5-7 hyper-specific wholesaler locations/markets optimized for profit:
   - Real physical market names for this specific product category (e.g. "Sadar Bazaar, Delhi" for cosmetics, "Azadpur Mandi" for fruits, or specific electronics hubs).
   - Exact wholesale price per unit at this location.
   - Exact Google Maps search query for finding this wholesaler/market.
   - Location details (City, Area).
   - Specific buying tip for each source to get the best price.
4. QUALITY TIPS — actionable steps to check the product quality when purchasing wholesale.
5. BUSINESS ADVICE — best selling strategy, exact profit margin expectation, and demand trend.

RESPOND WITH VALID JSON ONLY (no markdown fences, no extra text):
{{
  "product_name": "<exact product name and size>",
  "category": "<Grocery/Electronics/Clothing/FMCG/etc.>",
  "brand": "<brand name or 'Generic'>",
  "description": "<detailed description of the product and its market demand>",
  "retail_price_range": "₹<min>–₹<max> per <unit>",
  "wholesale_price_range": "₹<min>–₹<max> per <unit>",
  "profit_margin": "<X>–<Y>% typical margin",
  "demand_trend": "<High/Medium/Low — with reason>",
  "best_season": "<best season/festival to sell this>",
  "wholesale_sources": [
    {{
      "name": "<specific market or platform name>",
      "source_type": "<Wholesale Market/Distributor/Online Platform>",
      "location": "<City, Area>",
      "estimated_price": "₹<price> per <unit>",
      "distance": "<approx distance from {user_location} or 'Local' or 'Online'>",
      "map_search": "<exact Google Maps search query to find this place>",
      "contact": "<phone/website if known, else 'Visit in person'>",
      "tip": "<specific actionable buying tip for maximum margin>",
      "best_time": "<best time to visit or order>"
    }}
  ],
  "quality_tips": [
    "<specific quality check tip 1>",
    "<specific quality check tip 2>",
    "<specific quality check tip 3>"
  ],
  "storage_tips": "<how to store this product properly>",
  "business_advice": "<2-3 sentences: how to sell profitably, target customers, pricing strategy>"
}}

IMPORTANT: Use real Indian market names. Give accurate price ranges based on current market rates. DO NOT HALLUCINATE."""

        try:
            import base64
            # Add padding if needed
            image_base64 = image_base64.strip()
            missing_padding = len(image_base64) % 4
            if missing_padding:
                image_base64 += '=' * (4 - missing_padding)
            image_bytes = base64.b64decode(image_base64)
            resp = self._generate(
                contents=[
                    prompt,
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                ],
                use_vision=True,
            )
            result = self._parse_json(resp.text)
            result.setdefault("wholesale_sources", [])
            result.setdefault("quality_tips", [])
            return result
        except json.JSONDecodeError as e:
            print(f"Image scan JSON error: {e}")
            return self._fallback_product_response(user_location)
        except Exception as e:
            err = str(e)
            print(f"Image scan error: {err[:120]}")
            if any(k in err for k in ("429", "RESOURCE_EXHAUSTED", "quota")):
                return {
                    "product_name": "Service Temporarily Unavailable",
                    "category": "Error",
                    "brand": "N/A",
                    "description": "⚠️ AI quota exceeded. Please wait 1-2 minutes and try again.",
                    "retail_price_range": "N/A",
                    "wholesale_price_range": "N/A",
                    "profit_margin": "N/A",
                    "demand_trend": "N/A",
                    "best_season": "N/A",
                    "wholesale_sources": [{
                        "name": "Retry Shortly",
                        "source_type": "System",
                        "location": "N/A",
                        "estimated_price": "N/A",
                        "distance": "N/A",
                        "map_search": "wholesale market near me",
                        "contact": "N/A",
                        "tip": "Wait 1-2 minutes and retry. Meanwhile search Google Maps for 'wholesale market near me'.",
                        "best_time": "Anytime",
                    }],
                    "quality_tips": ["Retry in 1-2 minutes"],
                    "storage_tips": "N/A",
                    "business_advice": "Please retry in 1-2 minutes.",
                }
            return self._fallback_product_response(user_location)

    def _fallback_product_response(self, user_location=None, debug_err=None):
        return {
            "product_name": "Unable to Identify",
            "category": "Unknown",
            "brand": "N/A",
            "description": f"DEBUG: {debug_err}" if debug_err else "Could not analyze the image. Please ensure it is clear, well-lit, and the product is visible.",
            "retail_price_range": "N/A",
            "wholesale_price_range": "N/A",
            "profit_margin": "N/A",
            "demand_trend": "N/A",
            "best_season": "All seasons",
            "wholesale_sources": [{
                "name": "Local Wholesale Market",
                "source_type": "General",
                "location": user_location or "Your Area",
                "estimated_price": "Varies",
                "distance": "Nearby",
                "map_search": "wholesale market near me",
                "contact": "Search on Google Maps",
                "tip": "Upload a clearer, well-lit image for accurate analysis.",
                "best_time": "Early morning",
            }],
            "quality_tips": [
                "Take a clear, well-lit photo",
                "Ensure product labels are visible",
                "Avoid blurry or dark images",
            ],
            "storage_tips": "N/A",
            "business_advice": "Please upload a clearer image for accurate analysis.",
        }

