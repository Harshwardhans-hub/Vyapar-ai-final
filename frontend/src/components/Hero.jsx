import { Link } from 'react-router-dom'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { getCurrentSeason, getSeasonEmoji } from '../services/api'

const sparkData = [
  { v: 30 }, { v: 45 }, { v: 38 }, { v: 60 }, { v: 55 }, { v: 75 }, { v: 68 }, { v: 90 }, { v: 85 }, { v: 110 }
]

export default function Hero() {
  const season = getCurrentSeason()

  return (
    <section className="relative pt-28 pb-20 overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-indigo-500">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-400 opacity-20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500 opacity-20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block bg-white/10 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            {getSeasonEmoji(season)} {season} Season • Made for Indian Shop Owners
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Grow Your Local<br />
            <span className="text-indigo-300">Business with AI</span>
          </h1>
          <p className="mt-6 text-lg text-indigo-100 max-w-lg">
            Vyapar AI is your personal digital advisor. We help local shop owners and vendors find wholesale markets, decide what to stock for festivals, and get step-by-step guidance on growing your business.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register"
              className="px-6 py-3 bg-white text-brand-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
              Start Free Trial
            </Link>
            <a href="#features"
              className="px-6 py-3 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
              See How It Works
            </a>
          </div>
          <div className="mt-10 flex gap-8">
            {[['1000+', 'Mandis & Maps'], ['Free', 'AI Advisor'], ['4 Seasons', 'Festival Ready']].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-sm text-indigo-200">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">{season} Sales Forecast</p>
              <p className="text-white text-2xl font-bold mt-1">₹2.4L <span className="text-green-400 text-sm font-medium">↑ 18%</span></p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a5b4fc" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                formatter={(v) => [`₹${v}K`, 'Revenue']}
              />
              <Area type="monotone" dataKey="v" stroke="#a5b4fc" strokeWidth={2} fill="url(#heroGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[['Products Sold', '1,245', '+12%'], ['Walk-ins', '340', '+8%'], ['Online Orders', '189', '+24%']].map(([label, val, delta]) => (
              <div key={label} className="bg-white/10 rounded-xl p-3">
                <p className="text-indigo-200 text-xs">{label}</p>
                <p className="text-white font-bold text-sm mt-1">{val}</p>
                <p className="text-green-400 text-xs font-medium">{delta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
