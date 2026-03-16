import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
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

const segmentData = [
  { segment: 'Enterprise', value: 42 },
  { segment: 'SMB', value: 31 },
  { segment: 'Startup', value: 18 },
  { segment: 'Consumer', value: 9 },
]

export default function AnalyticsPreview() {
  return (
    <section id="analytics" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-widest">AI Intelligence</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
            Predictions you can act on
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Our AI models continuously learn from your data to deliver forecasts with industry-leading accuracy.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-1">Revenue: Actual vs AI Forecast</h3>
            <p className="text-sm text-gray-400 mb-6">Monthly performance ($K)</p>
            <ResponsiveContainer width="100%" height={240}>
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

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-1">Customer Segment Distribution</h3>
            <p className="text-sm text-gray-400 mb-6">Revenue share by segment (%)</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={segmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="segment" type="category" tick={{ fontSize: 12 }} width={70} />
                <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: 'Forecast Accuracy', value: '97.8%', sub: 'vs industry avg 82%' },
            { label: 'Avg Revenue Lift', value: '+31%', sub: 'within 90 days' },
            { label: 'Churn Reduction', value: '44%', sub: 'with AI intervention' },
            { label: 'Time Saved', value: '18 hrs/wk', sub: 'per analyst' },
          ].map(s => (
            <div key={s.label} className="text-center bg-brand-50 rounded-2xl p-5">
              <p className="text-3xl font-extrabold text-brand-600">{s.value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
