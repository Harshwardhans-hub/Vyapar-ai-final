import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, Package, RefreshCw, Zap } from 'lucide-react';
import MoodSelector from '../components/MoodSelector';
import RecommendationCard from '../components/RecommendationCard';
import BundleCard from '../components/BundleCard';
import { SearchSkeleton, CardSkeleton, BundleSkeleton } from '../components/Skeletons';
import ErrorState from '../components/ErrorState';
import { getRecommendations, getSocialProof, getCurrentSeason, getSeasonEmoji } from '../services/api';

export default function Recommendations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const initialMood = searchParams.get('mood') || 'Comfort';

  const [query, setQuery] = useState(initialQuery);
  const [mood, setMood] = useState(initialMood);
  const [results, setResults] = useState(null);
  const [socialProof, setSocialProof] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const season = getCurrentSeason();

  useEffect(() => {
    if (initialQuery) {
      fetchRecommendations(initialQuery, initialMood);
    }
  }, []);

  const fetchRecommendations = async (q, m) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getRecommendations(searchQuery, m || mood);
      setResults(data);

      // Fetch social proof for recommendation IDs
      const ids = data.recommendations
        ?.map((r) => r.id)
        .filter((id) => id && id !== 'suggested' && id !== 'fallback-1');
      if (ids?.length) {
        try {
          const sp = await getSocialProof(ids);
          const spMap = {};
          sp.social_proof?.forEach((s) => (spMap[s.catalog_id] = s));
          setSocialProof(spMap);
        } catch {
          // Social proof is non-critical, fail silently
        }
      }
    } catch (e) {
      const errorType = e.isNetwork ? 'network' : e.isRateLimit ? 'rateLimit' : 'api';
      setError({ type: errorType, message: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecommendations();
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white truncate">
              {getSeasonEmoji(season)} AI Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-white/40">
              Powered by Gemini AI · {season} Season · {mood} Mood
              {results?._cached && (
                <span className="ml-2 text-primary-400 inline-flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Cached
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Search and Mood */}
        <div className="glass-card p-4 sm:p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you're looking for..."
              className="glass-input flex-1"
              maxLength={500}
            />
            <button type="submit" disabled={loading || !query.trim()} className="glass-button flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-40">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Thinking...' : 'Get AI Recs'}
            </button>
          </form>
          <MoodSelector
            selected={mood}
            onSelect={(m) => {
              setMood(m);
              if (query.trim()) fetchRecommendations(query, m);
            }}
          />
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="mb-8">
            <ErrorState
              error={error}
              type={error.type}
              onRetry={() => fetchRecommendations()}
            />
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && <SearchSkeleton />}

        {/* Results */}
        <AnimatePresence>
          {results && !loading && !error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Chat response */}
              {results.chat_response && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 sm:p-6 mb-8 bg-gradient-to-r from-primary-500/5 to-purple-500/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-primary-400 font-semibold mb-1">SeasonAI says</p>
                      <p className="text-white/70 text-sm leading-relaxed break-words">{results.chat_response}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Recommendations Grid */}
              {results.recommendations?.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-400" />
                    Top Picks for You
                    <span className="text-xs text-white/30 font-normal ml-2">
                      ({results.recommendations.length} results)
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {results.recommendations.map((item, i) => (
                      <RecommendationCard
                        key={item.id || i}
                        item={item}
                        index={i}
                        socialProof={socialProof[item.id]}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bundles */}
              {results.bundles?.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary-400" />
                    AI-Curated Bundles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {results.bundles.map((bundle, i) => (
                      <BundleCard key={i} bundle={bundle} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Refresh button */}
              <div className="text-center pt-6 pb-8">
                <button
                  onClick={() => fetchRecommendations()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white/50 
                             hover:bg-primary-500/10 hover:text-primary-400 transition-all text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate recommendations
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
