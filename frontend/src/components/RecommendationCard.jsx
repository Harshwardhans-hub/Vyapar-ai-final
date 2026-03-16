import { motion } from 'framer-motion';
import { Star, MapPin, ExternalLink, Eye, Brain } from 'lucide-react';
import { trackEvent } from '../services/api';

export default function RecommendationCard({ item, index, socialProof }) {
  const score = item.score || 0;
  const scorePct = Math.round(score * 100);

  const handleClick = () => {
    trackEvent('click', item.id);
  };

  const handleView = () => {
    trackEvent('view', item.id);
  };

  // Mood color mapping
  const moodColors = {
    Adventurous: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    Romantic: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    Budget: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Comfort: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  };

  const viewCount = socialProof?.view_count || Math.floor(Math.random() * 20) + 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      onViewportEnter={handleView}
      className="glass-card-hover group cursor-pointer"
      onClick={handleClick}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
        <img
          src={item.image_url || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400`}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Score ring */}
        <div className="absolute top-3 right-3">
          <div
            className="score-ring text-white bg-black/40 backdrop-blur-md"
            style={{ '--score-pct': `${scorePct}%` }}
          >
            {scorePct}
          </div>
        </div>

        {/* Social proof badge */}
        <div className="absolute top-3 left-3">
          <div className="social-badge">
            <Eye className="w-3 h-3" />
            <span>{viewCount} viewed recently</span>
          </div>
        </div>

        {/* Price badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-sm font-semibold border border-white/10">
            {item.price_range || '$$'} · ${item.price || 'N/A'}
          </span>
        </div>

        {/* Mood tag */}
        {item.mood_match && (
          <div className="absolute bottom-3 right-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${moodColors[item.mood_match] || 'text-white/60 bg-white/5 border-white/10'}`}>
              {item.mood_match}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title and rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display font-bold text-lg text-white group-hover:text-primary-400 transition-colors">
            {item.name}
          </h3>
          <div className="flex items-center gap-1 text-yellow-400 shrink-0 ml-2">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">{item.rating || '4.5'}</span>
          </div>
        </div>

        {/* Category and location */}
        <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
          <span className="px-2 py-0.5 rounded bg-white/5">{item.category}</span>
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.location}
            </span>
          )}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px] text-white/30 bg-white/5 border border-white/5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Explainable AI reason */}
        {item.reason && (
          <div className="mt-3 p-3 rounded-xl bg-primary-500/5 border border-primary-500/10">
            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-primary-400 font-semibold mb-1">
                  Recommended because...
                </p>
                <p className="text-xs text-white/60 leading-relaxed">{item.reason}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
