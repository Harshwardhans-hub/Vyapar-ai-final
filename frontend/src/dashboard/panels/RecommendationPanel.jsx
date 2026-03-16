import { useState } from 'react'
import { getRecommendations, getCurrentSeason } from '../../services/api'

const moods = ['Comfort', 'Adventurous', 'Romantic', 'Budget']

export default function RecommendationPanel() {
  const [query, setQuery] = useState('')
  const [mood, setMood] = useState('Comfort')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const season = getCurrentSeason()

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const data = await getRecommendations(query, mood)
      setResults(data)
    } catch {
      setResults(null)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Smart Recommendation Engine</h2>
        <p className="text-gray-500 text-sm mt-1">AI-generated seasonal recommendations powered by Gemini & pgvector — {season} Season</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Describe what you're looking for..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button onClick={search} disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
            {loading ? 'Thinking...' : '🎯 Search'}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {moods.map(m => (
            <button key={m} onClick={() => setMood(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                mood === m
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Response */}
      {results?.chat_response && (
        <div className="bg-brand-50 rounded-xl p-5 border border-brand-100">
          <p className="text-xs text-brand-600 font-semibold mb-1">🤖 SeasonAI says</p>
          <p className="text-gray-700 text-sm leading-relaxed">{results.chat_response}</p>
        </div>
      )}

      {/* Recommendations */}
      {results?.recommendations?.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Top {results.recommendations.length} Recommendations</h3>
          {results.recommendations.map((r, i) => (
            <div key={r.id || i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">{r.category}</span>
                    <span className="text-sm font-semibold text-gray-900">{r.name}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{r.reason}</p>
                  {r.tags?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {r.tags.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-green-600 font-bold text-sm">{r.price_range} ${r.price}</p>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(r.score || 0) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{Math.round((r.score || 0) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bundles */}
      {results?.bundles?.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">🎁 AI-Curated Bundles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {results.bundles.map((b, i) => (
              <div key={i} className="bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100 rounded-xl p-5">
                <p className="font-bold text-gray-900">{b.title}</p>
                <p className="text-gray-500 text-xs mt-1">{b.tagline}</p>
                <div className="mt-3 space-y-1">
                  {b.items?.map((item, j) => (
                    <p key={j} className="text-sm text-gray-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> {item}
                    </p>
                  ))}
                </div>
                <p className="mt-3 text-brand-700 font-bold text-sm">${b.total_price} total</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
