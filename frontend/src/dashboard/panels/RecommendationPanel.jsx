import { useState } from 'react'
import { getRecommendations, getCurrentSeason } from '../../services/api'

const BIZ_TYPES = [
  { label: 'Vegetable Shop',    icon: '🥦', value: 'Vegetable Shop'  },
  { label: 'Kirana / Grocery', icon: '🛒', value: 'Kirana'          },
  { label: 'Clothing Store',   icon: '👗', value: 'Apparel'         },
  { label: 'Fruit Shop',       icon: '🍎', value: 'Fruit Shop'      },
  { label: 'Mobile / Electric',icon: '📱', value: 'Electronics'     },
  { label: 'Gift / Festival',  icon: '🎁', value: 'Gift'            },
  { label: 'Beauty / Personal',icon: '💄', value: 'Beauty'          },
  { label: 'Dhaba / Food',     icon: '🍛', value: 'TeaStall'        },
]

const STRATEGIES = [
  { label: '🔥 Budget Stock',    value: 'Budget'       },
  { label: '⚖️ Steady Sellers',  value: 'Comfort'      },
  { label: '🚀 Trending Now',    value: 'Adventurous'  },
  { label: '💎 Premium Stock',   value: 'Romantic'     },
]

const UPCOMING = ['Spring Season', 'Holi Upcoming', 'Ugadi Upcoming']

export default function RecommendationPanel() {
  const [selectedBiz, setSelectedBiz] = useState(null)
  const [query, setQuery]             = useState('')
  const [mood, setMood]               = useState('Adventurous')
  const [results, setResults]         = useState(null)
  const [loading, setLoading]         = useState(false)
  const season = getCurrentSeason()

  const search = async (overrideBiz) => {
    const biz = overrideBiz || selectedBiz || 'Local Shop'
    const fullQuery = query.trim() || `Best items to stock for ${biz} business for upcoming ${season} season festivals`
    setLoading(true)
    setResults(null)
    try {
      const data = await getRecommendations(fullQuery, mood, { businessType: biz })
      setResults(data)
    } catch {
      setResults(null)
    }
    setLoading(false)
  }

  const handleBizClick = (biz) => {
    setSelectedBiz(biz.value)
    setQuery(`Best wholesale stock for ${biz.label} in ${season}`)
    search(biz.value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">AI Stock Recommendations</h2>
          <p className="text-gray-500 text-sm mt-1">
            Tell us your business type → AI suggests what to buy wholesale this{' '}
            <span className="text-brand-600 font-bold">{season}</span> season
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {UPCOMING.map(tag => (
            <span key={tag} className="text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded-full">
              🌸 {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Business Type Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Your Business Type (Quick Start)</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BIZ_TYPES.map(biz => (
            <button
              key={biz.value}
              onClick={() => handleBizClick(biz)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all hover:border-brand-400 hover:bg-brand-50 text-left ${
                selectedBiz === biz.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-md shadow-brand-100'
                  : 'border-gray-100 text-gray-700 bg-gray-50'
              }`}
            >
              <span className="text-lg">{biz.icon}</span>
              <span className="text-xs leading-tight">{biz.label}</span>
            </button>
          ))}
        </div>

        {/* Custom query input */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Or describe your business in your own words</p>
          <div className="flex gap-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="e.g. I run a small dhaba, which food items and ingredients should I stock now?"
              className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 text-sm text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-400 placeholder:font-normal"
            />
            <button
              onClick={() => search()}
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-brand-200 transition-all active:scale-95 disabled:opacity-60 shrink-0 flex items-center gap-2"
            >
              🎯 {loading ? 'Analyzing...' : 'Get AI Advice'}
            </button>
          </div>
        </div>

        {/* Strategy pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Strategy:</span>
          {STRATEGIES.map(s => (
            <button
              key={s.value}
              onClick={() => setMood(s.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                mood === s.value
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-100'
                  : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-brand-200 hover:bg-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-gray-100 rounded-2xl" />
          <div className="h-40 bg-gray-50 rounded-2xl" />
        </div>
      )}

      {/* Chat Response */}
      {results?.chat_response && (
        <div className="bg-brand-50 rounded-2xl px-6 py-5 border border-brand-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-sm">🤖</div>
            <p className="text-xs text-brand-600 font-black uppercase tracking-wider">
              Vyapar AI Business Advisor · {season} Strategy · {mood}
            </p>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed font-medium">{results.chat_response}</p>
        </div>
      )}

      {/* Tabs */}
      {results && (
        <div className="flex gap-3">
          <div className="text-xs font-bold bg-orange-100 text-orange-700 px-4 py-2 rounded-xl flex items-center gap-1.5">
            🔥 Top Products ({results.recommendations?.length || 0})
          </div>
          {results.bundles?.length > 0 && (
            <div className="text-xs font-bold bg-purple-100 text-purple-700 px-4 py-2 rounded-xl flex items-center gap-1.5">
              🎁 Bulk Bundles ({results.bundles.length})
            </div>
          )}
        </div>
      )}

      {/* Section header */}
      {results?.recommendations?.length > 0 && (
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Recommended Wholesale Purchases for {season} · Sorted by Demand Potential
        </p>
      )}

      {/* Recommendation Cards */}
      {results?.recommendations?.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {results.recommendations.map((r, i) => (
            <div key={r.id || i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-black px-2 py-1 rounded bg-indigo-50 text-indigo-600 uppercase tracking-tighter">
                      {r.category}
                    </span>
                    <h4 className="text-base font-black text-gray-900 group-hover:text-brand-600 transition-colors">
                      {r.name}
                    </h4>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-3">{r.reason}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {r.tags?.map(t => (
                      <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-50 text-gray-400 border border-gray-100">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="bg-green-50 px-3 py-2 rounded-2xl inline-block border border-green-100">
                    <p className="text-green-700 font-black text-xs uppercase tracking-widest mb-0.5">Est. Wholesale</p>
                    <p className="text-green-600 font-black text-lg">₹{r.price}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Demand Potential</p>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden ml-auto">
                      <div className="h-full bg-brand-500 rounded-full transition-all duration-1000" style={{ width: `${(r.score || 0) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
