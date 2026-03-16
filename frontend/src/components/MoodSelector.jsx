import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Heart, Wallet, Coffee } from 'lucide-react';

const moods = [
  { id: 'Adventurous', label: 'Adventurous', icon: Flame, color: 'from-orange-500 to-red-500', emoji: '🔥', desc: 'Try something daring & new' },
  { id: 'Romantic', label: 'Romantic', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕', desc: 'Perfect for date nights' },
  { id: 'Budget', label: 'Budget', icon: Wallet, color: 'from-emerald-500 to-green-500', emoji: '💰', desc: 'Smart savings, great finds' },
  { id: 'Comfort', label: 'Comfort', icon: Coffee, color: 'from-amber-500 to-yellow-500', emoji: '☕', desc: 'Cozy & familiar favorites' },
];

export default function MoodSelector({ selected, onSelect }) {
  const [hoveredMood, setHoveredMood] = useState(null);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-2">
        <span className="text-2xl">🎭</span> How are you feeling today?
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {moods.map((mood, index) => {
          const Icon = mood.icon;
          const isSelected = selected === mood.id;
          const isHovered = hoveredMood === mood.id;

          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              onClick={() => onSelect(mood.id)}
              className={`relative p-4 rounded-2xl text-left transition-all duration-300 overflow-hidden group ${
                isSelected
                  ? 'ring-2 ring-white/30 shadow-lg shadow-primary-500/20'
                  : 'hover:ring-1 hover:ring-white/10'
              }`}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(76, 110, 245, 0.3), rgba(112, 72, 232, 0.2))'
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isSelected ? 'rgba(76, 110, 245, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
              }}
            >
              {/* Gradient overlay on hover/select */}
              <div
                className={`absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-br ${mood.color} ${
                  isSelected ? 'opacity-10' : 'group-hover:opacity-5'
                }`}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{mood.emoji}</span>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-400' : 'text-white/50'}`} />
                </div>
                <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-white/70'}`}>
                  {mood.label}
                </p>
                <p className="text-xs text-white/40 mt-1">{mood.desc}</p>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center"
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
