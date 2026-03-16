# 🏗️ Architecture — SeasonAI

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Home    │  │ Discover │  │  Voice   │  │    Dashboard     │   │
│  │  Page    │  │  Results │  │  Search  │  │   (Analytics)    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │              │              │                  │             │
│  ┌────┴──────────────┴──────────────┴──────────────────┴─────────┐  │
│  │  React + Vite + Tailwind CSS + Framer Motion + Recharts      │  │
│  │  Deployed on: Vercel (Free Tier)                               │  │
│  └──────────────────────────────┬────────────────────────────────┘  │
└─────────────────────────────────┼──────────────────────────────────┘
                                  │ REST API (HTTPS)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FLASK API SERVER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐               │
│  │   /api/      │  │   /api/     │  │   /api/      │               │
│  │  recommend   │  │   event     │  │  analytics   │               │
│  └──────┬───────┘  └──────┬──────┘  └──────┬───────┘               │
│         │                  │                │                        │
│  ┌──────┴──────────────────┴────────────────┴───────┐               │
│  │                  Service Layer                    │               │
│  │  ┌────────────────┐  ┌───────────┐  ┌──────────┐│               │
│  │  │ Recommendation │  │ Embedding │  │Analytics ││               │
│  │  │   Service      │  │  Service  │  │ Service  ││               │
│  │  └────────┬───────┘  └─────┬─────┘  └────┬─────┘│               │
│  └───────────┼────────────────┼──────────────┼──────┘               │
│  Deployed on: Railway (Free Trial)                                   │
└──────────────┼────────────────┼──────────────┼───────────────────────┘
               │                │              │
    ┌──────────▼──────┐  ┌─────▼──────┐  ┌────▼──────────┐
    │  Google Gemini   │  │ HuggingFace│  │   Supabase    │
    │  2.5 Flash       │  │ Inference  │  │  PostgreSQL   │
    │                  │  │   API      │  │  + pgvector   │
    │  • Recs engine   │  │            │  │               │
    │  • Mood matching │  │  • all-    │  │  • users      │
    │  • Bundle gen    │  │   MiniLM-  │  │  • catalog    │
    │  • Explainable   │  │   L6-v2    │  │  • events     │
    │  • Chat AI       │  │  • 384-dim │  │  • bundles    │
    │                  │  │   vectors  │  │  • embeddings │
    │  Free: 100 RPD   │  │            │  │               │
    └──────────────────┘  │  Free tier │  │  Free: 500MB  │
                          └────────────┘  └───────────────┘
```

## Data Flow: Recommendation Pipeline

```
1. User Input        2. Embedding         3. Vector Search
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Query: "cozy │────▶│ HuggingFace  │────▶│ pgvector     │
│ Italian"     │     │ all-MiniLM   │     │ cosine       │
│ Mood: Romantic│    │ → [384 floats]│    │ similarity   │
│ Season: Spring│    └──────────────┘     │ → Top 15     │
└──────────────┘                          └──────┬───────┘
                                                  │
4. AI Ranking        5. Response          ◀───────┘
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Gemini 2.5   │────▶│ Ranked recs  │     │ Catalog items│
│ Flash        │     │ + Reasons    │     │ + Metadata   │
│ + Mood ctx   │     │ + Bundles    │     │ + Embeddings │
│ + Season ctx │     │ + Chat       │     └──────────────┘
└──────────────┘     └──────────────┘
```

## Component Architecture (Frontend)

```
App.jsx
├── Navbar.jsx (Navigation + Season indicator)
├── ChatInterface.jsx (Floating AI chat)
├── Pages/
│   ├── Home.jsx
│   │   ├── MoodSelector.jsx
│   │   └── Search Bar
│   ├── Recommendations.jsx
│   │   ├── MoodSelector.jsx
│   │   ├── RecommendationCard.jsx (×N)
│   │   │   └── Social Proof Badge
│   │   │   └── Explainable AI section
│   │   └── BundleCard.jsx (×N)
│   ├── VoiceSearchPage.jsx
│   │   ├── VoiceSearch.jsx (Web Speech API)
│   │   └── MoodSelector.jsx
│   └── Dashboard.jsx
│       └── AnalyticsChart.jsx (Recharts)
└── services/api.js (Axios + helpers)
```

## Key Design Decisions

### 1. Gemini over OpenAI
- Free tier: 100 RPD vs OpenAI's $5 minimum
- 1M token context window
- Native JSON generation

### 2. HuggingFace over local models
- No GPU required on server
- Free inference API
- all-MiniLM-L6-v2 is fast and accurate for semantic search

### 3. Supabase over raw PostgreSQL
- Built-in pgvector support
- RLS for security
- Free hosted database with API
- Real-time capabilities for future use

### 4. Seasonal Intelligence
- Auto-detects season from current date
- Influences both AI prompts and UI
- Catalog items tagged with season relevance
- Unique differentiator vs Google Maps/Yelp

### 5. Event-Driven Social Proof
- Real-time counts from event logs (not fake data)
- "12 people viewed in last hour" drives engagement
- Events power the analytics dashboard
