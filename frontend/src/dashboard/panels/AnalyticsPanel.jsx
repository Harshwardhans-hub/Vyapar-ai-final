import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const revenueData = [
  { month: 'Jan', actual: 65, predicted: 68 },
  { month: 'Feb', actual: 72, predicted: 74 },
  { month: 'Mar', actual: 68, predicted: 71 },
  { month: 'Apr', actual: 85, predicted: 83 },
  { month: 'May', actual: 91, predicted: 89 },
  { month: 'Jun', actual: 98, predicted: 102 },
  { month: 'Jul', actual: 110, predicted: 108 },
]

const kpis = [
  { label: 'Total Revenue', value: '$2.4M', delta: '+18%', up: true },
  { label: 'Active Users', value: '24.5K', delta: '+12%', up: true },
  { label: 'Conversion Rate', value: '8.3%', delta: '+2.1%', up: true },
  { label: 'Churn Rate', value: '3.2%', delta: '-0.8%', up: false },
]

export default function AnalyticsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI Business Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Real-time KPIs and AI-powered revenue forecasting</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-medium">{k.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{k.value}</p>
            <span className={`text-xs font-semibold ${k.up ? 'text-green-500' : 'text-green-500'}`}>{k.delta}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Revenue: Actual vs AI Forecast ($K)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} name="Actual" />
            <Line type="monotone" dataKey="predicted" stroke="#a5b4fc" strokeWidth={2} strokeDasharray="5 5" dot={false} name="AI Forecast" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
