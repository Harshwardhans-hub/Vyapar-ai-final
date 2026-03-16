import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

export default function ErrorState({ error, onRetry, type = 'general' }) {
  const errorConfig = {
    network: {
      icon: WifiOff,
      title: 'Connection Lost',
      message: 'Unable to reach the server. Please check your internet connection or make sure the backend is running.',
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
    },
    api: {
      icon: AlertTriangle,
      title: 'Something Went Wrong',
      message: error?.message || 'The AI service encountered an error. Please try again.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
    },
    general: {
      icon: AlertTriangle,
      title: 'Oops!',
      message: error?.message || 'An unexpected error occurred.',
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
    },
    rateLimit: {
      icon: AlertTriangle,
      title: 'Slow Down!',
      message: 'You\'ve made too many requests. Please wait a moment before trying again.',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
  };

  const config = errorConfig[type] || errorConfig.general;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 text-center max-w-md mx-auto"
    >
      <div className={`w-16 h-16 rounded-2xl ${config.bgColor} flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-8 h-8 ${config.color}`} />
      </div>
      <h3 className="text-lg font-display font-bold text-white mb-2">{config.title}</h3>
      <p className="text-sm text-white/50 mb-6 leading-relaxed">{config.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="glass-button inline-flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </motion.div>
  );
}
