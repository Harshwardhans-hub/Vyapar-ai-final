import { useState } from 'react'
import { Link } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'
import { getCurrentSeason, getSeasonEmoji } from '../services/api'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
]

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const loggedIn = isAuthenticated()
  const season = getCurrentSeason()

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-xl text-brand-900">SeasonAI</span>
          <span className="hidden sm:inline text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-medium">
            {getSeasonEmoji(season)} {season}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <a key={l.label} href={l.href}
              className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {loggedIn ? (
            <Link to="/dashboard"
              className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login"
                className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors px-4 py-2">
                Log in
              </Link>
              <Link to="/register"
                className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 rounded-md text-gray-600" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          {navLinks.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="text-sm font-medium text-gray-700 hover:text-brand-600">
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            {loggedIn ? (
              <Link to="/dashboard" onClick={() => setOpen(false)}
                className="text-sm font-semibold text-center bg-brand-600 text-white rounded-lg py-2 hover:bg-brand-700">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}
                  className="text-sm font-medium text-center border border-gray-300 rounded-lg py-2 hover:border-brand-500">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-center bg-brand-600 text-white rounded-lg py-2 hover:bg-brand-700">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
