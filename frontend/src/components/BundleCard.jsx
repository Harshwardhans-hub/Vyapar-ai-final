import { motion } from 'framer-motion';
import { Package, Sparkles, DollarSign, Tag } from 'lucide-react';
import { trackEvent } from '../services/api';

export default function BundleCard({ bundle, index }) {
  const handleClick = () => {
    trackEvent('bundle_click', null, { bundle_title: bundle.title });
  };

  const moodGradients = {
    Adventurous: 'from-orange-500/20 to-red-500/10',
    Romantic: 'from-pink-500/20 to-rose-500/10',
    Budget: 'from-emerald-500/20 to-green-500/10',
    Comfort: 'from-amber-500/20 to-yellow-500/10',
  };

  const gradient = moodGradients[bundle.mood] || 'from-primary-500/20 to-purple-500/10';

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      onClick={handleClick}
      className={`glass-card-hover p-6 cursor-pointer bg-gradient-to-br ${gradient}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white">{bundle.title}</h3>
            {bundle.season && (
              <span className="text-[10px] uppercase tracking-wider text-white/30">
                {bundle.season} Special
              </span>
            )}
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
      </div>

      {/* Tagline */}
      {bundle.tagline && (
        <p className="text-sm text-white/50 mb-4 italic">"{bundle.tagline}"</p>
      )}

      {/* Items list */}
      <div className="space-y-2 mb-4">
        {bundle.items?.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
            <span className="text-sm text-white/70">{item}</span>
          </div>
        ))}
      </div>

      {/* Price and CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        {bundle.total_price && (
          <div className="flex items-center gap-1 text-white">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-lg">{bundle.total_price}</span>
            <span className="text-xs text-white/40 ml-1">estimated</span>
          </div>
        )}
        <button className="px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-medium 
                           hover:bg-primary-500/30 transition-all duration-200 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          Grab Bundle
        </button>
      </div>

      {/* Mood badge */}
      {bundle.mood && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/40 border border-white/5">
          {bundle.mood}
        </div>
      )}
    </motion.div>
  );
}
