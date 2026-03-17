# 🚀 Vyapar AI — Smart Local Business Ecosystem

> **Vyapar AI** — A comprehensive AI ecosystem for local businesses, featuring intelligent recommendations, product analysis, wholesale sourcing, and business growth tools.

![Architecture](docs/architecture-diagram.png)

## 🌟 What Makes This Different

| Feature | Google Maps | Yelp | **Vyapar AI** |
|---|---|---|---|
| AI Recommendations | ❌ Basic | ❌ None | ✅ Gemini-powered contextual |
| AI Chat Assistant | ❌ | ❌ | ✅ Real-time business support |
| Product Analyzer | ❌ | ❌ | ✅ Image-based wholesale sourcing |
| Wholesale Map | ❌ | ❌ | ✅ Dedicated supplier footprints |
| Business Startup Guide | ❌ | ❌ | ✅ AI-generated roadmaps |
| Owner Analytics | Paid | Paid | ✅ Free comprehensive dashboard |

## 🏗️ Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│  React + Vite       │────▶│  Flask REST API      │
│  (Vercel)           │     │  (Railway)           │
│                     │     │                      │
│  • MoodSelector     │     │  POST /api/recommend │
│  • VoiceSearch      │     │  POST /api/event     │
│  • ProductScanner   │     │  GET  /api/social    │
│  • WholesaleMap     │     │  GET  /api/analytics │
│  • ChatInterface    │     │  POST /api/chat      │
│  • BusinessGuide    │     │  POST /api/scan      │
└─────────────────────┘     └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │  Supabase            │
                            │  (PostgreSQL+pgvector)│
                            │                      │
                            │  • users             │
                            │  • catalog           │
                            │  • events            │
                            │  • wholesalers       │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │  AI Layer            │
                            │                      │
                            │  • Gemini 2.0 Flash  │
                            │  • HuggingFace       │
                            │    (all-MiniLM-L6-v2)│
                            └─────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind CSS | Free |
| Backend | Python 3.11 + Flask | Free |
| Database | Supabase (PostgreSQL + pgvector) | Free (500MB) |
| AI Model | Google Gemini 2.0 Flash | Free (1500 RPD) |
| Embeddings | Google Gemini text-embedding-004 | Free |
| Charts | Recharts | Free |
| Voice | Web Speech API (Browser built-in) | Free |
| Deploy (FE) | Vercel | Free |
| Deploy (BE) | Railway | Free ($5 trial) |

## 🚀 Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python seed_data.py
python app.py
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

## 🔑 Environment Variables

### Backend (.env)
```
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
FLASK_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## 🚀 10 Core Innovations

### 1. 💬 AI Business Chat Assistant
A multi-lingual conversational AI that helps entrepreneurs with marketing tips, inventory management, and day-to-day business strategy.

### 2. 📸 AI Product Scanner & Analyzer
Upload an image of any product to identify its market value, quality attributes, and the best wholesale sources to buy it from.

### 3. 🗺️ Wholesale Sourcing Map
A specialized map interface for business owners to discover and navigate to trusted wholesalers, manufacturers, and trade hubs.

### 4. 📝 Business Startup Guide
Step-by-step, AI-powered blueprints customized for starting various types of businesses, including licenses, cost estimates, and scaling steps.

### 5. 🎭 Mood-Based AI Recommendations
Intelligent seasonal filtering (Adventurous, Romantic, Budget, Comfort) that adjusts results based on real-time emotional context.

### 6. 📊 Real-Time Social Proof
Live engagement tracking: "15 users are currently viewing this wholesaler," creating trust and dynamic market visibility.

### 7. 🎁 AI Bundle Builder
Generates smart product/service bundles (e.g., "Cafe Setup Starter Pack") using Gemini AI to maximize seller revenue.

### 8. 🧠 Explainable AI (XAI)
Provides transparent reasoning for every recommendation, explaining the exact factors behind AI-driven business insights.

### 9. 📈 Owner Analytics Dashboard
Comprehensive data visualization for business owners to track reach, engagement, and conversion rates for free.

### 10. 🎤 Voice-Powered Search
Hands-free natural language processing allows users to search for suppliers or business advice using only their voice.

## 🌦️ Seasonal Intelligence

The system automatically detects the current season and adjusts recommendations:
- **Spring** 🌸 — Fresh stock arrivals, outdoor setups
- **Summer** ☀️ — Seasonal beverage hubs, cooling solutions
- **Autumn** 🍂 — Harvest-based sourcing, festive prep
- **Winter** ❄️ — Warm comfort services, holiday trade peaks

## 📄 License

MIT License — Free to use and modify for all entrepreneurs.
