import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';

export default function VoiceSearch({ onResult, onTranscript }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interimTranscript += t;
        }
      }

      const current = finalTranscript || interimTranscript;
      setTranscript(current);
      onTranscript?.(current);

      if (finalTranscript) {
        onResult?.(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      setError(`Voice error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onResult, onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  if (!supported) {
    return (
      <div className="glass-card p-4 text-center text-white/50 text-sm">
        🎤 Voice search is not supported in this browser. Try Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Voice Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening
            ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/40'
            : 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50'
        }`}
      >
        {/* Ripple effects when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 3, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: 'easeOut',
                  }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {isListening ? (
          <MicOff className="w-8 h-8 text-white relative z-10" />
        ) : (
          <Mic className="w-8 h-8 text-white relative z-10" />
        )}
      </motion.button>

      {/* Status text */}
      <div className="text-center">
        {isListening ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-red-400"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Listening...</span>
          </motion.div>
        ) : (
          <p className="text-sm text-white/40">
            {transcript ? 'Tap to search again' : 'Tap to speak your query'}
          </p>
        )}
      </div>

      {/* Transcript display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-4 w-full max-w-md text-center"
          >
            <p className="text-white/60 text-xs mb-1">You said:</p>
            <p className="text-white font-medium">"{transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}

      {/* Sample queries */}
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {[
          'Find a cozy Italian place',
          'Budget-friendly lunch spots',
          'Date night under $50',
          'Best desserts nearby',
        ].map((sample) => (
          <button
            key={sample}
            onClick={() => {
              setTranscript(sample);
              onTranscript?.(sample);
              onResult?.(sample);
            }}
            className="px-3 py-1.5 rounded-full text-xs text-white/50 border border-white/10 
                       hover:border-primary-500/50 hover:text-primary-400 transition-all duration-200"
          >
            "{sample}"
          </button>
        ))}
      </div>
    </div>
  );
}
