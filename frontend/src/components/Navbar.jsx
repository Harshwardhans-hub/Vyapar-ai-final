import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Mic, BarChart3, Menu, X } from 'lucide-react';
import { getCurrentSeason, getSeasonEmoji } from '../services/api';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/recommendations', label: 'Discover', icon: Search },
  { path: '/voice', label: 'Voice', icon: Mic },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const season = getCurrentSeason();

  return (
    <nav className="sticky top-0 z-40" style={{
      background: 'rgba(10, 10, 15, 0.8)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
    }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="font-display font-bold text-lg text-white group-hover:text-primary-400 transition-colors">
              Season<span className="text-primary-400">AI</span>
            </span>
            <span className="hidden md:inline-flex text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/5">
              {getSeasonEmoji(season)} {season}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-400 shadow-sm'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-white/5"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                    isActive ? 'bg-primary-500/10 text-primary-400' : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
