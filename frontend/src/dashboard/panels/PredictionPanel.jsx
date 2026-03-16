import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const churnData = [
  { week: 'W1', risk: 12 }, { week: 'W2', risk: 18 }, { week: 'W3', risk: 14 },
  { week: 'W4', risk: 22 }, { week: 'W5', risk: 19 }, { week: 'W6', risk: 28 },
  { week: 'W7', risk: 24 }, { week: 'W8', risk: 31 },
]

const customers = [
  { name: 'Acme Corp', score: 87, risk: 'High', segment: 'Enterprise' },
  { name: 'TechStart Inc', score: 62, risk: 'Medium', segment: 'SMB' },
  { name: 'RetailCo', score: 91, risk: 'High', segment: 'Enterprise' },
  { name: 'FinEdge', score: 45, risk: 'Low', segment: 'Startup' },
  { name: 'LogiCorp', score: 78, risk: 'Medium', segment: 'SMB' },
]

const riskColor = { High: 'bg-red-100 text-red-600', Medium: 'bg-yellow-100 text-yellow-700', Low: 'bg-green-100 text-green-600' }

export default function PredictionPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Customer Behavior Prediction</h2>
        <p className="text-gray-500 text-sm mt-1">AI-predicted churn risk and customer health scores</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Churn Risk Trend (8 weeks)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={churnData}>
            <defs>
              <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v}%`, 'Churn Risk']} />
            <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} fill="url(#churnGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">At-Risk Customer Accounts</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Customer', 'Health Score', 'Risk Level', 'Segment'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map(c => (
              <tr key={c.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${c.score}%` }} />
                    </div>
                    <span className="text-gray-600">{c.score}</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${riskColor[c.risk]}`}>{c.risk}</span>
                </td>
                <td className="px-6 py-3 text-gray-500">{c.segment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
