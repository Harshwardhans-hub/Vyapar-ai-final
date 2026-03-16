import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { logout, getUser } from '../utils/auth'
import { getCurrentSeason, getSeasonEmoji } from '../services/api'
import DashboardOverview from '../dashboard/panels/DashboardOverview'
import AnalyticsPanel from '../dashboard/panels/AnalyticsPanel'
import PredictionPanel from '../dashboard/panels/PredictionPanel'
import RecommendationPanel from '../dashboard/panels/RecommendationPanel'
import VoicePanel from '../dashboard/panels/VoicePanel'
import MapPanel from '../dashboard/panels/MapPanel'

const navItems = [
  { id: 'overview',        label: 'Dashboard',              icon: '🖥️' },
  { id: 'analytics',       label: 'AI Analytics',           icon: '📊' },
  { id: 'prediction',      label: 'Behavior Prediction',    icon: '🔮' },
  { id: 'recommendations', label: 'AI Recommendations',     icon: '🎯' },
  { id: 'voice',           label: 'Voice Assistant',        icon: '🎙️' },
  { id: 'map',             label: 'Local Business Map',     icon: '🗺️' },
]

const panels = {
  overview:        <DashboardOverview />,
  analytics:       <AnalyticsPanel />,
  prediction:      <PredictionPanel />,
  recommendations: <RecommendationPanel />,
  voice:           <VoicePanel />,
  map:             <MapPanel />,
}

export default function Dashboard() {
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const user = getUser()
  const season = getCurrentSeason()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-brand-900 flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-lg text-white">SeasonAI</span>
          <span className="text-xs bg-white/10 text-indigo-200 px-2 py-0.5 rounded-full ml-auto">
            {getSeasonEmoji(season)}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActive(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
                ${active === item.id
                  ? 'bg-white/15 text-white'
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Quick links */}
        <div className="px-3 py-2 border-t border-white/10">
          <Link to="/recommend" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-indigo-300 hover:bg-white/10 hover:text-white transition-colors">
            <span className="text-lg">✨</span>
            Full Recommendations
          </Link>
          <Link to="/voice-search" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-indigo-300 hover:bg-white/10 hover:text-white transition-colors">
            <span className="text-lg">🔍</span>
            Voice Search
          </Link>
        </div>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold uppercase">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate capitalize">{user?.name || 'User'}</p>
              <p className="text-indigo-300 text-xs truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-xs text-indigo-300 hover:text-white border border-white/10 hover:border-white/30 rounded-lg py-1.5 transition-colors">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-4 shrink-0">
          <button className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-sm font-semibold text-gray-700">
            {navItems.find(n => n.id === active)?.label}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-gray-400">{season} Season</span>
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            <span className="text-xs text-gray-400">Live</span>
          </div>
        </header>

        {/* Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {panels[active]}
        </main>
      </div>
    </div>
  )
}
