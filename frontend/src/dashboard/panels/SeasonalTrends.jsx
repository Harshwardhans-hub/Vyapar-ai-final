import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const festiveData = [
  { week: 'W1', demand: 30 }, { week: 'W2', demand: 45 }, { week: 'W3', demand: 38 },
  { week: 'W4', demand: 60 }, { week: 'W5', demand: 55 }, { week: 'W6', demand: 85 },
  { week: 'W7', demand: 75 }, { week: 'W8', demand: 110 },
]

const trendingProducts = [
  { name: 'Organic Colors (Holi)', popularity: 95, margin: 'High', source: 'Azadpur Mandi' },
  { name: 'Sweets & Namkeen', popularity: 82, margin: 'Medium', source: 'Kucha Mahajani' },
  { name: 'Cotton Kurtas', popularity: 78, margin: 'High', source: 'Gandhi Nagar' },
  { name: 'Outdoor Furniture', popularity: 45, margin: 'Low', source: 'Kirti Nagar' },
  { name: 'Fresh Mangoes', popularity: 92, margin: 'High', source: 'Okhla Mandi' },
]

const marginColor = { High: 'bg-green-100 text-green-600', Medium: 'bg-yellow-100 text-yellow-700', Low: 'bg-red-100 text-red-600' }

export default function SeasonalTrends() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Seasonal Trends & Festive Demand</h2>
        <p className="text-gray-500 text-sm mt-1">AI-predicted demand spikes for upcoming local festivals</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Festive Demand Forecast (8 weeks)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={festiveData}>
            <defs>
              <linearGradient id="festiveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v}%`, 'Demand Growth']} />
            <Area type="monotone" dataKey="demand" stroke="#4f46e5" strokeWidth={2} fill="url(#festiveGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">High-Margin Trending Products</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Product', 'Popularity', 'Margin', 'Best Source'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {trendingProducts.map(p => (
              <tr key={p.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.popularity}%` }} />
                    </div>
                    <span className="text-gray-600">{p.popularity}%</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${marginColor[p.margin]}`}>{p.margin}</span>
                </td>
                <td className="px-6 py-3 text-gray-500">{p.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
