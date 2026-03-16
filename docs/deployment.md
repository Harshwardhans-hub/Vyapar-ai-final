# 🚀 Deployment Guide — SeasonAI

## Architecture Overview

```
User → Vercel (React Frontend) → Railway (Flask API) → Supabase (Database)
                                       ↓
                              Gemini AI + HuggingFace
```

## 1. Supabase Setup (Database)

### Create Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (any region close to you)
3. Save the **Project URL** and **Anon Key** from Settings → API

### Initialize Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `database/schema.sql`
3. Run the SQL to create tables, indexes, and functions
4. Verify tables are created: `users`, `catalog`, `events`, `bundles`

### Enable pgvector
The schema.sql already includes `CREATE EXTENSION IF NOT EXISTS vector;`
This should work automatically on Supabase free tier.

## 2. Get API Keys

### Google Gemini API Key (Free)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with Google account
3. Click "Get API Key" → Create API Key
4. Free tier: 100 requests/day with Gemini 2.5 Flash

### HuggingFace API Token (Free)
1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a new token (read access is sufficient)
3. This gives free access to sentence-transformers/all-MiniLM-L6-v2

## 3. Backend Deployment (Railway)

### Prerequisites
- GitHub repository with your code
- Railway account ([railway.app](https://railway.app))

### Steps
1. Push your code to GitHub
2. Go to Railway → New Project → Deploy from GitHub
3. Select your repository and the `backend` directory
4. Add environment variables:
   ```
   GEMINI_API_KEY=your_key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_anon_key
   HF_API_TOKEN=your_token
   FLASK_ENV=production
   PORT=5000
   ```
5. Set the start command: `gunicorn app:app --bind 0.0.0.0:$PORT`
6. Deploy — Railway will auto-detect Python and install requirements.txt

### Seed Database
After backend is deployed:
```bash
cd backend
python seed_data.py
```

## 4. Frontend Deployment (Vercel)

### Steps
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Set Root Directory to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app
   ```
5. Build settings (auto-detected):
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
6. Deploy

## 5. Post-Deployment Verification

### Test Endpoints
```bash
# Health check
curl https://your-backend.railway.app/

# Test recommendation
curl -X POST https://your-backend.railway.app/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "cozy dinner", "mood": "Romantic"}'

# Test analytics
curl https://your-backend.railway.app/api/analytics
```

### Test Frontend
1. Visit your Vercel URL
2. Try searching with text
3. Try voice search (Chrome/Edge)
4. Check the Dashboard page
5. Verify chat works

## 6. Cost Summary

| Service | Cost | Limits |
|---|---|---|
| Supabase | $0/month | 500MB storage, 2 projects |
| Gemini API | $0/month | 100 requests/day |
| HuggingFace | $0/month | Rate-limited inference |
| Vercel | $0/month | Unlimited deployments |
| Railway | $5 trial | Then ~$5/month |

**Total: $0 to start** (Railway trial covers initial usage)

## Troubleshooting

### CORS Issues
Backend has CORS configured with `flask-cors`. If issues persist, update the `CORS(app, origins=["*"])` in `app.py` to specify your Vercel domain.

### Supabase Connection
If "Tenant or user not found" error:
1. Verify SUPABASE_URL format: `https://xxxxx.supabase.co`
2. Verify SUPABASE_KEY is the anon key (not service role key)
3. Check that RLS policies are set up correctly

### Embedding Errors
If HuggingFace API returns errors:
1. The model may need warm-up time on first request
2. Add `"wait_for_model": true` in options (already included)
3. Free tier has rate limits — space requests 1+ second apart
