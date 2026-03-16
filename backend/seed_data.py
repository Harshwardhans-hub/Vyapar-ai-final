"""
Seed Data — Populate Supabase with sample local businesses.
Seasonal, mood-aware catalog items for demonstration.
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from supabase import create_client
from services.embedding import EmbeddingService

Config.validate()

supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
embedding_service = EmbeddingService()

# ─── Sample Users ───────────────────────────────────────────────
SAMPLE_USERS = [
    {
        "name": "Demo Customer",
        "email": "customer@seasonai.demo",
        "role": "customer",
        "preferences": {"favorite_categories": ["Restaurant", "Cafe"], "budget_range": "$$"},
        "location": "Downtown",
    },
    {
        "name": "Business Owner Demo",
        "email": "owner@seasonai.demo",
        "role": "business_owner",
        "preferences": {},
        "location": "Main Street",
    },
]

# ─── Sample Catalog ─────────────────────────────────────────────
SAMPLE_CATALOG = [
    # RESTAURANTS
    {
        "name": "Bella Notte Trattoria",
        "description": "Authentic Italian restaurant with handmade pasta, wood-fired pizzas, and an intimate candlelit dining room. Perfect for romantic evenings with a curated wine list and seasonal specials featuring local produce.",
        "category": "Restaurant",
        "subcategory": "Italian",
        "price": 28.0,
        "price_range": "$$$",
        "rating": 4.8,
        "review_count": 342,
        "location": "Downtown",
        "address": "123 Main Street",
        "tags": ["italian", "pasta", "wine", "date-night", "fine-dining"],
        "mood_tags": ["Romantic", "Comfort"],
        "season_tags": ["Spring", "Summer", "Autumn", "Winter"],
        "cuisine_type": "Italian",
        "ambiance": "Romantic",
        "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    },
    {
        "name": "Spice Route Kitchen",
        "description": "Bold and exotic fusion restaurant blending Indian, Thai, and Mexican flavors. Features adventurous tasting menus, fiery cocktails, and an open kitchen concept with live cooking stations.",
        "category": "Restaurant",
        "subcategory": "Fusion",
        "price": 22.0,
        "price_range": "$$",
        "rating": 4.6,
        "review_count": 218,
        "location": "Arts District",
        "address": "456 Spice Lane",
        "tags": ["fusion", "spicy", "exotic", "tasting-menu", "cocktails"],
        "mood_tags": ["Adventurous"],
        "season_tags": ["Spring", "Summer", "Autumn", "Winter"],
        "cuisine_type": "Fusion",
        "ambiance": "Energetic",
        "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
    },
    {
        "name": "Green Bowl Cafe",
        "description": "Farm-to-table healthy eatery with freshly pressed juices, acai bowls, grain salads, and plant-based meals. Everything under $15 with generous portions and a sunny patio.",
        "category": "Restaurant",
        "subcategory": "Healthy",
        "price": 12.0,
        "price_range": "$",
        "rating": 4.5,
        "review_count": 189,
        "location": "University Area",
        "address": "789 Green Ave",
        "tags": ["healthy", "salads", "vegan", "budget-friendly", "patio"],
        "mood_tags": ["Budget", "Comfort"],
        "season_tags": ["Spring", "Summer"],
        "cuisine_type": "Health food",
        "ambiance": "Casual",
        "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    },
    {
        "name": "Grandma's Kitchen",
        "description": "Home-style comfort food restaurant serving classic recipes passed down through generations. Mac and cheese, pot roast, mashed potatoes, and fresh-baked pies. Like eating at grandma's house.",
        "category": "Restaurant",
        "subcategory": "American",
        "price": 16.0,
        "price_range": "$$",
        "rating": 4.7,
        "review_count": 456,
        "location": "Midtown",
        "address": "321 Home Blvd",
        "tags": ["comfort-food", "homestyle", "classic", "pies", "family"],
        "mood_tags": ["Comfort"],
        "season_tags": ["Autumn", "Winter"],
        "cuisine_type": "American",
        "ambiance": "Cozy",
        "image_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
    },
    {
        "name": "Sakura Sushi Bar",
        "description": "Premium Japanese sushi restaurant with omakase experience, fresh sashimi flown in daily, and a tranquil zen garden setting. Chef's special seasonal rolls change monthly.",
        "category": "Restaurant",
        "subcategory": "Japanese",
        "price": 35.0,
        "price_range": "$$$",
        "rating": 4.9,
        "review_count": 278,
        "location": "Waterfront",
        "address": "555 Harbor Dr",
        "tags": ["sushi", "japanese", "omakase", "premium", "zen"],
        "mood_tags": ["Romantic", "Adventurous"],
        "season_tags": ["Spring", "Summer", "Autumn", "Winter"],
        "cuisine_type": "Japanese",
        "ambiance": "Elegant",
        "image_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
    },
    {
        "name": "Taco Fiesta Street Cart",
        "description": "Authentic street tacos at unbeatable prices. $3 tacos, $5 burritos, fresh salsa bar, and homemade horchata. Open late night with a festive atmosphere and live mariachi on weekends.",
        "category": "Restaurant",
        "subcategory": "Mexican",
        "price": 8.0,
        "price_range": "$",
        "rating": 4.4,
        "review_count": 523,
        "location": "Food Truck Alley",
        "address": "100 Street Food Row",
        "tags": ["tacos", "street-food", "cheap-eats", "late-night", "festive"],
        "mood_tags": ["Budget", "Adventurous"],
        "season_tags": ["Spring", "Summer"],
        "cuisine_type": "Mexican",
        "ambiance": "Festive",
        "image_url": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
    },
    # CAFES
    {
        "name": "The Cozy Bean",
        "description": "Artisanal coffee shop with house-roasted beans, specialty lattes, and freshly baked pastries. Features a fireplace reading corner, board games, and free WiFi. Perfect for rainy days.",
        "category": "Cafe",
        "subcategory": "Coffee Shop",
        "price": 6.0,
        "price_range": "$",
        "rating": 4.6,
        "review_count": 312,
        "location": "Old Town",
        "address": "42 Cozy Lane",
        "tags": ["coffee", "pastries", "wifi", "reading", "fireplace"],
        "mood_tags": ["Comfort", "Romantic"],
        "season_tags": ["Autumn", "Winter"],
        "cuisine_type": "Coffee & Pastries",
        "ambiance": "Cozy",
        "image_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
    },
    {
        "name": "Frost & Brew",
        "description": "Innovative dessert cafe specializing in nitrogen ice cream, cold brew flights, and elaborate milkshakes. Instagram-worthy presentations and seasonal flavor experiments.",
        "category": "Cafe",
        "subcategory": "Dessert",
        "price": 10.0,
        "price_range": "$",
        "rating": 4.3,
        "review_count": 167,
        "location": "Shopping Mall",
        "address": "200 Mall Plaza",
        "tags": ["ice-cream", "desserts", "instagram", "cold-brew", "innovative"],
        "mood_tags": ["Adventurous", "Comfort"],
        "season_tags": ["Summer", "Spring"],
        "cuisine_type": "Desserts",
        "ambiance": "Fun",
        "image_url": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
    },
    # SHOPPING / RETAIL
    {
        "name": "Season's Harvest Market",
        "description": "Local farmer's market with fresh seasonal produce, artisan cheeses, organic honey, handmade crafts, and locally roasted coffee. Live music on Saturday mornings.",
        "category": "Shopping",
        "subcategory": "Market",
        "price": 15.0,
        "price_range": "$",
        "rating": 4.8,
        "review_count": 389,
        "location": "City Park",
        "address": "1 Park Plaza",
        "tags": ["farmers-market", "organic", "local", "fresh", "crafts"],
        "mood_tags": ["Comfort", "Adventurous"],
        "season_tags": ["Spring", "Summer", "Autumn"],
        "cuisine_type": None,
        "ambiance": "Lively",
        "image_url": "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400",
    },
    {
        "name": "Velvet & Vine Boutique",
        "description": "Curated fashion boutique featuring seasonal collections from local designers. From cozy winter knits to breezy summer dresses. Personal styling sessions available.",
        "category": "Shopping",
        "subcategory": "Fashion",
        "price": 55.0,
        "price_range": "$$",
        "rating": 4.5,
        "review_count": 134,
        "location": "Fashion Row",
        "address": "88 Style Street",
        "tags": ["fashion", "boutique", "local-designers", "seasonal", "styling"],
        "mood_tags": ["Romantic", "Adventurous"],
        "season_tags": ["Spring", "Summer", "Autumn", "Winter"],
        "cuisine_type": None,
        "ambiance": "Elegant",
        "image_url": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400",
    },
    # ENTERTAINMENT
    {
        "name": "Starlight Cinema",
        "description": "Outdoor rooftop cinema showing classic and indie films under the stars. Bean bag seating, gourmet popcorn, craft beer bar, and blankets provided during cooler months.",
        "category": "Entertainment",
        "subcategory": "Cinema",
        "price": 18.0,
        "price_range": "$$",
        "rating": 4.7,
        "review_count": 256,
        "location": "Rooftop District",
        "address": "500 Sky Terrace",
        "tags": ["cinema", "outdoor", "rooftop", "indie-films", "beer"],
        "mood_tags": ["Romantic", "Adventurous"],
        "season_tags": ["Summer", "Spring", "Autumn"],
        "cuisine_type": None,
        "ambiance": "Romantic",
        "image_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
    },
    {
        "name": "Escape Room Mania",
        "description": "Thrilling escape room experience with 6 themed rooms including haunted mansion, space station, and ancient temple. Team challenges for 2-8 players with varying difficulty levels.",
        "category": "Entertainment",
        "subcategory": "Activities",
        "price": 25.0,
        "price_range": "$$",
        "rating": 4.6,
        "review_count": 198,
        "location": "Entertainment Zone",
        "address": "75 Fun Ave",
        "tags": ["escape-room", "team-building", "adventure", "puzzles", "themed"],
        "mood_tags": ["Adventurous"],
        "season_tags": ["Spring", "Summer", "Autumn", "Winter"],
        "cuisine_type": None,
        "ambiance": "Exciting",
        "image_url": "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400",
    },
    # WELLNESS
    {
        "name": "Zen Garden Spa",
        "description": "Luxurious day spa offering hot stone massages, aromatherapy, facial treatments, and private couple's suites. Seasonal treatments using local herbs and botanical ingredients.",
        "category": "Wellness",
        "subcategory": "Spa",
        "price": 75.0,
        "price_range": "$$$",
        "rating": 4.9,
        "review_count": 201,
        "location": "Wellness Quarter",
        "address": "33 Serenity Road",
        "tags": ["spa", "massage", "relaxation", "couples", "luxury"],
        "mood_tags": ["Romantic", "Comfort"],
        "season_tags": ["Spring", "Summer", "Autumn", "Winter"],
        "cuisine_type": None,
        "ambiance": "Serene",
        "image_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400",
    },
    {
        "name": "Sunrise Yoga Studio",
        "description": "Community yoga studio with classes for all levels. Morning rooftop sessions, candlelit evening flows, and weekend workshops. First class free! Student discounts available.",
        "category": "Wellness",
        "subcategory": "Fitness",
        "price": 15.0,
        "price_range": "$",
        "rating": 4.7,
        "review_count": 167,
        "location": "Wellness Quarter",
        "address": "35 Serenity Road",
        "tags": ["yoga", "fitness", "meditation", "community", "rooftop"],
        "mood_tags": ["Comfort", "Budget"],
        "season_tags": ["Spring", "Summer", "Autumn", "Winter"],
        "cuisine_type": None,
        "ambiance": "Peaceful",
        "image_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400",
    },
    # SEASONAL SPECIALS
    {
        "name": "Winter Wonderland Market",
        "description": "Annual holiday market with artisan gifts, hot chocolate bar, carolers, ice skating rink, and visit with Santa. Hand-knitted scarves, ornaments, and locally made candles.",
        "category": "Shopping",
        "subcategory": "Seasonal Market",
        "price": 20.0,
        "price_range": "$",
        "rating": 4.8,
        "review_count": 445,
        "location": "City Center",
        "address": "1 Town Square",
        "tags": ["holiday", "christmas", "gifts", "hot-chocolate", "skating"],
        "mood_tags": ["Comfort", "Romantic"],
        "season_tags": ["Winter"],
        "cuisine_type": None,
        "ambiance": "Festive",
        "image_url": "https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=400",
    },
    {
        "name": "Pumpkin Patch Farm",
        "description": "Autumn adventure destination with corn maze, hayrides, pumpkin picking, apple cider donuts, and spooky nights in October. Fun for families and couples alike.",
        "category": "Entertainment",
        "subcategory": "Seasonal",
        "price": 12.0,
        "price_range": "$",
        "rating": 4.6,
        "review_count": 334,
        "location": "Countryside",
        "address": "Route 7 Farm Road",
        "tags": ["pumpkin", "autumn", "family", "corn-maze", "hayride"],
        "mood_tags": ["Adventurous", "Comfort"],
        "season_tags": ["Autumn"],
        "cuisine_type": None,
        "ambiance": "Rustic",
        "image_url": "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=400",
    },
    {
        "name": "Rooftop BBQ & Brews",
        "description": "Summer-only rooftop barbecue joint with smoked brisket, craft IPAs, live DJ sets, and sunset views. Weekly specials and happy hour from 4-7pm. Best summer hangout in town.",
        "category": "Restaurant",
        "subcategory": "BBQ",
        "price": 20.0,
        "price_range": "$$",
        "rating": 4.5,
        "review_count": 289,
        "location": "Rooftop District",
        "address": "501 Sky Terrace",
        "tags": ["bbq", "rooftop", "craft-beer", "summer", "live-music"],
        "mood_tags": ["Adventurous", "Comfort"],
        "season_tags": ["Summer"],
        "cuisine_type": "BBQ",
        "ambiance": "Party",
        "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
    },
    {
        "name": "Spring Blossom Tea House",
        "description": "Elegant tea house surrounded by cherry blossom gardens. Premium loose-leaf teas, delicate macarons, and afternoon tea sets. Seasonal cherry blossom matcha available in spring.",
        "category": "Cafe",
        "subcategory": "Tea House",
        "price": 18.0,
        "price_range": "$$",
        "rating": 4.7,
        "review_count": 156,
        "location": "Garden District",
        "address": "22 Blossom Way",
        "tags": ["tea", "cherry-blossom", "macarons", "afternoon-tea", "garden"],
        "mood_tags": ["Romantic", "Comfort"],
        "season_tags": ["Spring"],
        "cuisine_type": "Tea & Pastries",
        "ambiance": "Elegant",
        "image_url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
    },
    {
        "name": "Budget Bites Food Court",
        "description": "Multi-cuisine food court with 12 vendors. Everything under $10! From ramen to burgers to falafel. Student ID gets extra 10% off. Open till midnight.",
        "category": "Restaurant",
        "subcategory": "Food Court",
        "price": 8.0,
        "price_range": "$",
        "rating": 4.2,
        "review_count": 678,
        "location": "University Area",
        "address": "50 Campus Road",
        "tags": ["budget", "variety", "student-deals", "late-night", "multi-cuisine"],
        "mood_tags": ["Budget"],
        "season_tags": ["Spring", "Summer", "Autumn", "Winter"],
        "cuisine_type": "Multi-cuisine",
        "ambiance": "Casual",
        "image_url": "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400",
    },
]


def seed_database():
    """Seed the Supabase database with sample data."""
    print("🌱 Starting database seed...")

    # 1. Insert Users
    print("\n👤 Inserting sample users...")
    for user in SAMPLE_USERS:
        try:
            result = supabase.table("users").upsert(user, on_conflict="email").execute()
            print(f"   ✅ {user['name']} ({user['role']})")
        except Exception as e:
            print(f"   ❌ Error inserting {user['name']}: {e}")

    # Get owner ID for catalog items
    owner_result = supabase.table("users").select("id").eq("role", "business_owner").limit(1).execute()
    owner_id = owner_result.data[0]["id"] if owner_result.data else None

    # 2. Insert Catalog Items with Embeddings
    print("\n📦 Inserting catalog items with embeddings...")
    for i, item in enumerate(SAMPLE_CATALOG):
        try:
            # Generate embedding for the item description
            embed_text = f"{item['name']} {item['description']} {item.get('category', '')} {' '.join(item.get('tags', []))}"
            print(f"   🔄 Generating embedding for: {item['name']}...")
            embedding = embedding_service.get_embedding(embed_text)

            # Add embedding and owner
            item["embedding"] = embedding
            if owner_id:
                item["owner_id"] = owner_id

            result = supabase.table("catalog").insert(item).execute()
            print(f"   ✅ {item['name']} (${item['price']}) — {item['category']}")

            # Rate limit for HuggingFace API
            if i < len(SAMPLE_CATALOG) - 1:
                time.sleep(1)

        except Exception as e:
            print(f"   ❌ Error inserting {item['name']}: {e}")

    # 3. Generate some sample events
    print("\n📊 Generating sample events...")
    catalog_result = supabase.table("catalog").select("id").execute()
    catalog_ids = [c["id"] for c in catalog_result.data] if catalog_result.data else []

    user_result = supabase.table("users").select("id").eq("role", "customer").limit(1).execute()
    user_id = user_result.data[0]["id"] if user_result.data else None

    if catalog_ids and user_id:
        import random

        event_types = ["view", "view", "view", "click", "click", "purchase"]  # Weighted
        for _ in range(50):
            event = {
                "user_id": user_id,
                "catalog_id": random.choice(catalog_ids),
                "event_type": random.choice(event_types),
                "metadata": {"source": "seed_data"},
                "session_id": f"seed-session-{random.randint(1, 5)}",
            }
            try:
                supabase.table("events").insert(event).execute()
            except Exception as e:
                print(f"   ❌ Event error: {e}")

        print(f"   ✅ Generated 50 sample events")

    print("\n🎉 Database seeding complete!")
    print(f"   📦 {len(SAMPLE_CATALOG)} catalog items")
    print(f"   👤 {len(SAMPLE_USERS)} users")
    print(f"   📊 50 sample events")


if __name__ == "__main__":
    seed_database()
