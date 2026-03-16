"""
AI Recommendation Service — Gemini 2.5 Flash
Handles mood-based recommendations, bundle generation, and explainable AI.
"""
import json
import re
from datetime import datetime
from google import genai
from config import Config


def get_current_season():
    """Determine the current season based on date."""
    month = datetime.now().month
    if month in (3, 4, 5):
        return "Spring"
    elif month in (6, 7, 8):
        return "Summer"
    elif month in (9, 10, 11):
        return "Autumn"
    else:
        return "Winter"


SEASON_CONTEXT = {
    "Spring": "Fresh, outdoor dining, light seasonal menus, garden events, cherry blossoms, renewal themes, fresh produce, spring sales",
    "Summer": "Cool treats, rooftop bars, ice cream, water activities, refreshing drinks, outdoor festivals, summer clearance, beach essentials",
    "Autumn": "Cozy cafes, harvest menus, warm drinks, pumpkin spice, comfort food, fall fashion, holiday prep, thanksgiving specials",
    "Winter": "Comfort food, indoor experiences, holiday specials, hot chocolate, warm clothing, gift shopping, New Year deals, winter clearance",
}

MOOD_PROMPTS = {
    "Adventurous": "thrilling, unique, off-the-beaten-path, exotic, novel experiences, exciting new discoveries, bold flavors, unusual finds",
    "Romantic": "intimate, cozy, candlelit, elegant, couples-friendly, scenic views, soft ambiance, special occasion worthy",
    "Budget": "affordable, value-for-money, deals, discounts, budget-friendly, great portions, free activities, student-friendly prices",
    "Comfort": "familiar, warm, nostalgic, home-style, relaxing, soothing, stress-free, easygoing, predictable quality",
}


class RecommendationService:
    """AI-powered recommendation engine using Gemini 2.5 Flash."""

    def __init__(self):
        self.client = genai.Client(api_key=Config.GEMINI_API_KEY)
        self.model = Config.GEMINI_MODEL

    def get_recommendations(
        self,
        query: str,
        mood: str = "Comfort",
        catalog_items: list = None,
        user_preferences: dict = None,
        season: str = None,
    ) -> dict:
        """
        Generate AI recommendations with explanations and bundles.
        
        Pipeline:
        1. Build context from catalog items, mood, season
        2. Send to Gemini with structured prompt
        3. Parse and return structured JSON
        """
        if not season:
            season = get_current_season()

        mood_context = MOOD_PROMPTS.get(mood, MOOD_PROMPTS["Comfort"])
        season_desc = SEASON_CONTEXT.get(season, "")

        # Build catalog context for the AI
        catalog_text = ""
        if catalog_items:
            for item in catalog_items[:20]:  # Limit to top 20 matches
                catalog_text += f"""
- ID: {item.get('id', 'N/A')}
  Name: {item.get('name', 'Unknown')}
  Category: {item.get('category', 'General')}
  Price: ${item.get('price', 'N/A')}
  Price Range: {item.get('price_range', '$$')}
  Rating: {item.get('rating', 'N/A')}★ ({item.get('review_count', 0)} reviews)
  Description: {item.get('description', '')}
  Location: {item.get('location', 'Local')}
  Tags: {', '.join(item.get('tags', []))}
  Mood Tags: {', '.join(item.get('mood_tags', []))}
  Season Tags: {', '.join(item.get('season_tags', []))}
  Cuisine: {item.get('cuisine_type', 'Various')}
  Ambiance: {item.get('ambiance', 'Casual')}
"""

        # Build user preference context
        pref_text = ""
        if user_preferences:
            pref_text = f"""
User Preferences:
- Favorite categories: {', '.join(user_preferences.get('favorite_categories', []))}
- Budget range: {user_preferences.get('budget_range', '$$')}
- Dietary restrictions: {', '.join(user_preferences.get('dietary', []))}
- Past favorites: {', '.join(user_preferences.get('past_favorites', []))}
"""

        prompt = f"""SYSTEM ROLE: You are SeasonAI, a world-class local business recommendation AI.
You ALWAYS respond with valid JSON only. Never use markdown, code blocks, or plain text.

TASK: Analyze the query, mood, and season to recommend the best local businesses.

CONTEXT:
- Season: {season} | Seasonal vibe: {season_desc}
- Mood: {mood} | Preferences: {mood_context}
- Query: "{query}"
{pref_text}

CATALOG DATA (ranked by vector similarity):
{catalog_text if catalog_text else "[No catalog matches — suggest plausible local businesses]"}

STEP-BY-STEP INSTRUCTIONS:
1. RANK: Pick the TOP 5 catalog items matching query + mood + season. Use similarity, mood_tags, season_tags.
2. EXPLAIN: For each, write a 2-sentence "reason" that SPECIFICALLY references:
   a) How it matches the user's query keywords
   b) Why it fits the "{mood}" mood
   c) What makes it great for {season}
   GOOD reason: "Their handmade pasta and candlelit tables perfectly match your romantic mood. As a spring special, they offer herb-infused dishes from local farms."
   BAD reason: "This is a great place." (too vague — NEVER do this)
3. SCORE: Assign relevance 0.0-1.0. Best match gets 0.95-1.0, others proportionally lower.
4. BUNDLE: Create 2 themed bundles combining 2-3 items. Name them creatively.
5. CHAT: Write a friendly 2-3 sentence summary mentioning the season and mood.

OUTPUT — valid JSON only:
{{
    "recommendations": [
        {{
            "id": "<catalog id or 'suggested'>",
            "name": "<name>",
            "category": "<category>",
            "price": 0,
            "price_range": "$$",
            "rating": 4.5,
            "score": 0.95,
            "reason": "<2-sentence specific explanation>",
            "mood_match": "{mood}",
            "season_match": "{season}",
            "tags": ["tag1", "tag2"]
        }}
    ],
    "bundles": [
        {{
            "title": "<creative bundle name>",
            "items": ["<item 1>", "<item 2>"],
            "tagline": "<catchy one-liner>",
            "total_price": 45,
            "mood": "{mood}",
            "season": "{season}"
        }}
    ],
    "chat_response": "<friendly summary>",
    "season": "{season}",
    "mood": "{mood}"
}}"""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
            )

            # Parse the response
            text = response.text.strip()
            
            # Remove markdown code blocks if present
            if text.startswith("```"):
                text = re.sub(r"^```(?:json)?\s*", "", text)
                text = re.sub(r"\s*```$", "", text)

            result = json.loads(text)
            return result

        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {e}")
            print(f"   Raw response: {response.text[:500] if response else 'No response'}")
            return self._fallback_response(query, mood, season)

        except Exception as e:
            print(f"❌ Gemini API error: {e}")
            return self._fallback_response(query, mood, season)

    def _fallback_response(self, query: str, mood: str, season: str) -> dict:
        """Return a fallback response if AI fails."""
        return {
            "recommendations": [
                {
                    "id": "fallback-1",
                    "name": "Local Favorites",
                    "category": "Mixed",
                    "price": 15.0,
                    "price_range": "$$",
                    "rating": 4.5,
                    "score": 0.8,
                    "reason": f"A great {mood.lower()} choice for the {season.lower()} season based on your search for '{query}'.",
                    "mood_match": mood,
                    "season_match": season,
                    "tags": ["local", "popular"],
                }
            ],
            "bundles": [
                {
                    "title": f"{season} {mood} Experience",
                    "items": ["Seasonal Special", "Local Favorite", "Dessert"],
                    "tagline": f"The perfect {mood.lower()} outing for {season.lower()}",
                    "total_price": 45.0,
                    "mood": mood,
                    "season": season,
                }
            ],
            "chat_response": f"I found some great {mood.lower()} options for you this {season.lower()}! Check out the recommendations below.",
            "season": season,
            "mood": mood,
        }

    def generate_chat_response(self, message: str, context: dict = None) -> str:
        """Generate a conversational AI response."""
        season = get_current_season()
        ctx = ""
        if context:
            ctx = f"\nConversation context: {json.dumps(context)}"

        prompt = f"""You are SeasonAI, a friendly local business recommendation chatbot.
Current season: {season}
{ctx}

User message: "{message}"

Respond naturally and helpfully. If they're asking about local businesses, products, or recommendations,
provide useful suggestions considering the current {season} season. Keep responses concise (2-4 sentences).
Be warm, enthusiastic, and helpful."""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
            )
            return response.text.strip()
        except Exception as e:
            print(f"❌ Chat error: {e}")
            return f"I'd love to help you find great local spots this {season}! Could you tell me more about what you're looking for?"
