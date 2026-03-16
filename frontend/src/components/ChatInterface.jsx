import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../services/api';

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Hey there! 👋 I'm SeasonAI, your local business guide. Ask me anything about local spots, seasonal specials, or recommendations!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(userMsg, {
        messageHistory: messages.slice(-4),
      });
      setMessages((prev) => [...prev, { role: 'bot', content: res.response }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: "Oops! I had a hiccup. Try asking again! 🙏" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen
            ? 'bg-surface-800 text-white'
            : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-primary-500/40'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[500px] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(15, 15, 25, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-primary-500/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">SeasonAI Chat</p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-500 text-white rounded-tr-sm'
                        : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-accent-400" />
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5">
                    <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about local spots..."
                  className="glass-input text-sm py-2.5"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white
                             disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
