# 📡 API Documentation — SeasonAI

Base URL: `http://localhost:5000` (development) or your Railway URL (production)

---

## Health Check

### `GET /`

Returns API status and available endpoints.

**Response:**
```json
{
  "status": "✅ SeasonAI API is running",
  "season": "Spring",
  "version": "1.0.0",
  "endpoints": [...]
}
```

---

## POST /api/recommend

Generate AI-powered recommendations based on query, mood, and season.

### Request Body
```json
{
  "query": "Find a cozy Italian place under $20",
  "mood": "Romantic",
  "user_id": "optional-uuid",
  "preferences": {
    "favorite_categories": ["Restaurant", "Cafe"],
    "budget_range": "$$",
    "dietary": ["vegetarian"]
  }
}
```

### Mood Options
- `Adventurous` — thrilling, exotic, novel
- `Romantic` — intimate, elegant, couples
- `Budget` — affordable, value-for-money
- `Comfort` — familiar, warm, cozy

### Response
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "name": "Bella Notte Trattoria",
      "category": "Restaurant",
      "price": 28.0,
      "price_range": "$$$",
      "rating": 4.8,
      "score": 0.95,
      "reason": "Recommended because you're looking for romantic Italian dining. This place has an intimate candlelit setting perfect for your date night, with handmade pasta under your budget.",
      "mood_match": "Romantic",
      "season_match": "Spring",
      "tags": ["italian", "date-night"]
    }
  ],
  "bundles": [
    {
      "title": "Spring Date Night Package",
      "items": ["Bella Notte Dinner", "Spring Blossom Tea", "Starlight Cinema"],
      "tagline": "Romance under the spring sky",
      "total_price": 65.0,
      "mood": "Romantic",
      "season": "Spring"
    }
  ],
  "chat_response": "I found some wonderful romantic spots for you this spring! ...",
  "season": "Spring",
  "mood": "Romantic"
}
```

### Pipeline
1. Query → HuggingFace embedding (384 dims)
2. Embedding → pgvector similarity search (top 15)
3. Matched items + mood + season → Gemini 2.5 Flash prompt
4. Gemini generates ranked recommendations with explanations
5. Returns structured JSON

---

## POST /api/event

Track user behavior events for social proof and analytics.

### Request Body
```json
{
  "user_id": "optional-uuid",
  "catalog_id": "item-uuid",
  "event_type": "view",
  "metadata": {"source": "recommendation_card"},
  "session_id": "ses_abc123"
}
```

### Event Types
| Type | Description |
|---|---|
| `view` | User saw a recommendation card |
| `click` | User clicked for details |
| `purchase` | User made a purchase |
| `bundle_click` | User clicked a bundle |
| `search` | Text search query |
| `voice_search` | Voice search query |
| `mood_select` | User changed mood |
| `share` | User shared an item |

### Response
```json
{
  "success": true,
  "event_id": "uuid"
}
```

---

## GET /api/social-proof

Get real-time view and click counts for the last hour.

### Query Parameters
| Param | Description |
|---|---|
| `ids` | Comma-separated catalog IDs (optional) |

### Response
```json
{
  "social_proof": [
    {
      "catalog_id": "uuid",
      "view_count": 12,
      "click_count": 5
    }
  ]
}
```

---

## GET /api/analytics

Get business analytics dashboard data.

### Query Parameters
| Param | Default | Description |
|---|---|---|
| `days` | 7 | Lookback period in days |
| `owner_id` | null | Filter by business owner |

### Response
```json
{
  "summary": {
    "total_events": 450,
    "total_views": 245,
    "total_clicks": 128,
    "total_purchases": 34,
    "total_searches": 43,
    "total_bundle_clicks": 12,
    "conversion_rate": 26.56
  },
  "timeline": [
    {"date": "2026-03-10", "views": 35, "clicks": 18, "purchases": 5}
  ],
  "top_items": [
    {"catalog_id": "uuid", "name": "Bella Notte", "category": "Restaurant", "views": 45, "clicks": 28, "purchases": 12}
  ],
  "hourly_activity": [
    {"hour": "09:00", "count": 15}
  ],
  "event_breakdown": {"view": 245, "click": 128, "purchase": 34, "search": 43},
  "period_days": 7
}
```

---

## GET /api/catalog

Browse catalog items with filters.

### Query Parameters
| Param | Description |
|---|---|
| `category` | Filter by category |
| `mood` | Filter by mood tag |
| `season` | Filter by season tag (default: current) |
| `search` | Text search by name |
| `limit` | Number of items (default: 20) |

### Response
```json
{
  "catalog": [...],
  "total": 20
}
```

---

## POST /api/chat

AI chatbot for conversational recommendations.

### Request Body
```json
{
  "message": "What are the best cafes for a rainy day?",
  "context": {}
}
```

### Response
```json
{
  "response": "On rainy days, you'll love The Cozy Bean! They have a fireplace reading corner..."
}
```
