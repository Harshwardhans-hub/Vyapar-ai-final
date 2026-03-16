import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, Search, Sparkles } from 'lucide-react';
import VoiceSearch from '../components/VoiceSearch';
import MoodSelector from '../components/MoodSelector';
import { trackEvent, getCurrentSeason, getSeasonEmoji } from '../services/api';

export default function VoiceSearchPage() {
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState('');
  const [mood, setMood] = useState('Comfort');
  const season = getCurrentSeason();

  const handleVoiceResult = (text) => {
    trackEvent('voice_search', null, { query: text, mood });
    setTimeout(() => {
      navigate(`/recommendations?q=${encodeURIComponent(text)}&mood=${mood}`);
    }, 800);
  };

  return (
    <div className="min-h-screen px-4 py-8">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Mic className="w-6 h-6 text-primary-400" />
              Voice Search
            </h1>
            <p className="text-sm text-white/40">
              Speak naturally — AI understands context
            </p>
          </div>
        </div>

        {/* Season indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/50">
            {getSeasonEmoji(season)} Searching in {season} mode
          </span>
        </motion.div>

        {/* Voice Search Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 mb-8"
        >
          <VoiceSearch onResult={handleVoiceResult} onTranscript={setTranscript} />
        </motion.div>

        {/* Mood Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-8"
        >
          <MoodSelector selected={mood} onSelect={setMood} />
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-white/60 mb-4">💡 Voice Search Tips</h3>
          <div className="space-y-3">
            {[
              { q: '"Find a cozy Italian place under $20"', tip: 'Include budget preferences' },
              { q: '"Best date night spots for winter"', tip: 'Mention the season' },
              { q: '"Adventure activities this weekend"', tip: 'Be specific about timing' },
              { q: '"Healthy lunch near university"', tip: 'Include location context' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Search className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-white/70">{item.q}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
