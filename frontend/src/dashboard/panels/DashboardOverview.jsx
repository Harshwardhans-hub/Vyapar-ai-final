import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const weeklyData = [
  { day: 'Mon', revenue: 42, users: 310 },
  { day: 'Tue', revenue: 58, users: 420 },
  { day: 'Wed', revenue: 51, users: 380 },
  { day: 'Thu', revenue: 67, users: 490 },
  { day: 'Fri', revenue: 74, users: 530 },
  { day: 'Sat', revenue: 48, users: 290 },
  { day: 'Sun', revenue: 39, users: 240 },
]

const stats = [
  { label: 'Revenue Today', value: '$74K', delta: '+18%', icon: '💰' },
  { label: 'Active Users', value: '530', delta: '+8%', icon: '👥' },
  { label: 'Open Tickets', value: '12', delta: '-3', icon: '🎫' },
  { label: 'AI Alerts', value: '3', delta: 'New', icon: '🔔' },
]

const alerts = [
  { msg: 'Churn risk spike detected in Enterprise segment', level: 'warning' },
  { msg: 'Revenue forecast exceeded by 12% — Q3 on track', level: 'success' },
  { msg: 'New recommendation: upsell opportunity at Acme Corp', level: 'info' },
]

const alertStyle = {
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Business Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Your unified command center — updated in real time</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{s.icon}</span>
              <span className="text-xs font-semibold text-green-500">{s.delta}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Weekly Revenue ($K)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Daily Active Users</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="users" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800">AI Alerts</h3>
        {alerts.map((a, i) => (
          <div key={i} className={`border rounded-xl px-4 py-3 text-sm font-medium ${alertStyle[a.level]}`}>
            {a.msg}
          </div>
        ))}
      </div>
    </div>
  )
}
