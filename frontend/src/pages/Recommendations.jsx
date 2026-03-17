import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, TrendingUp, Store, Package } from 'lucide-react';
import { getRecommendations, getCurrentSeason, getSeasonEmoji } from '../services/api';

const moods = [
  { key: 'Budget', label: '💰 Budget-Friendly', desc: 'Best ROI products' },
  { key: 'Comfort', label: '🛋️ Steady Sellers', desc: 'Reliable demand items' },
  { key: 'Adventurous', label: '🚀 Trending', desc: 'New & viral products' },
  { key: 'Romantic', label: '🎁 Premium', desc: 'High-margin luxury' },
];

export default function Recommendations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [mood, setMood] = useState(searchParams.get('mood') || 'Comfort');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const season = getCurrentSeason();

  useEffect(() => {
    if (searchParams.get('q')) {
      handleSearch(searchParams.get('q'), searchParams.get('mood') || 'Comfort');
    }
  }, []);

  const handleSearch = async (q, m) => {
    const searchQuery = q || query;
    const searchMood = m || mood;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRecommendations(searchQuery, searchMood);
      setResults(data);
    } catch (err) {
      setError(err.isNetwork ? 'Cannot connect to server' : err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="page-dark min-h-screen px-4 py-8">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Store className="w-6 h-6 text-indigo-400" />
              Seasonal Product Recommendations
            </h1>
            <p className="text-sm text-white/40">
              {getSeasonEmoji(season)} AI-powered suggestions for what to stock this {season}
            </p>
          </div>
        </div>

        {/* Season Banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 mb-6 flex items-center gap-3">
          <span className="text-3xl">{getSeasonEmoji(season)}</span>
          <div>
            <p className="text-white font-semibold text-sm">{season} Season Business Insights</p>
            <p className="text-white/40 text-xs">
              Discover products & services your customers will want this {season.toLowerCase()}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-xs font-medium">Trending Now</span>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 mb-6 space-y-4">
          <div className="flex gap-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 'Best products to sell in spring', 'trending cafe items', 'what groceries sell best in summer'..."
              className="glass-input flex-1 text-white font-medium placeholder:text-zinc-400"
            />
            <button onClick={() => handleSearch()} disabled={loading}
              className="glass-button flex items-center gap-2 disabled:opacity-50">
              <Sparkles className="w-4 h-4" />
              {loading ? 'Analyzing...' : 'Get Insights'}
            </button>
          </div>

          {/* Mood/Strategy chips */}
          <div>
            <p className="text-white/40 text-xs mb-2 uppercase tracking-wider font-medium">Business Strategy</p>
            <div className="flex gap-2 flex-wrap">
              {moods.map(m => (
                <button key={m.key} onClick={() => setMood(m.key)}
                  className={`mood-chip flex items-center gap-2 ${mood === m.key ? 'active text-white' : 'text-white/60'}`}>
                  <span>{m.label}</span>
                  <span className="text-[10px] text-white/30 hidden sm:inline">• {m.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="glass-card p-4 mb-6 border-red-500/30 bg-red-500/5">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
            <button onClick={() => handleSearch()}
              className="text-xs text-indigo-400 hover:text-indigo-300 mt-2">Retry →</button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
                <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* AI Summary */}
        {results?.chat_response && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card p-5 mb-6 bg-indigo-500/5 border-indigo-500/20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="text-indigo-300 text-xs font-semibold mb-1">Vyapar AI Business Advisor</p>
                <p className="text-white/80 text-sm leading-relaxed">{results.chat_response}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {results?.recommendations?.length > 0 && !loading && (
          <div className="space-y-4 mb-8">
            <h3 className="text-white/60 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
              <Package className="w-4 h-4" />
              Top Products & Services to Stock ({results.recommendations.length})
            </h3>
            <AnimatePresence>
              {results.recommendations.map((r, i) => (
                <motion.div key={r.id || i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="glass-card-hover p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                          {r.category}
                        </span>
                        <span className="text-white font-semibold text-sm">{r.name}</span>
                      </div>
                      <p className="text-white/40 text-xs leading-relaxed">{r.reason}</p>
                      {r.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {r.tags.map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 border border-white/10">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-green-400 font-bold text-sm">{r.price_range || '$$'} {r.price}</p>
                      <div className="flex items-center gap-2 mt-1 justify-end">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(r.score || 0) * 100}%` }} />
                        </div>
                        <span className="text-xs text-white/40">{Math.round((r.score || 0) * 100)}%</span>
                      </div>
                      {r.rating && (
                        <p className="text-yellow-400 text-xs mt-1">⭐ {r.rating}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Bundles */}
        {results?.bundles?.length > 0 && !loading && (
          <div className="space-y-4">
            <h3 className="text-white/60 text-xs uppercase tracking-wider font-semibold">🎁 AI-Curated Product Bundles for Your Store</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {results.bundles.map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="glass-card p-5">
                  <p className="text-white font-bold text-sm">{b.title}</p>
                  <p className="text-white/40 text-xs mt-1">{b.tagline}</p>
                  <div className="mt-3 space-y-1.5">
                    {b.items?.map((item, j) => (
                      <p key={j} className="text-sm text-white/60 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {item}
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-indigo-400 font-bold text-sm">Bundle Price: {b.total_price}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">High Demand</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
