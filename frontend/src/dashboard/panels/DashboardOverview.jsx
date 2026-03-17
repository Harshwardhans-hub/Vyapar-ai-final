import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getCurrentSeason } from '../../services/api'

const footfallData = [
  { day: 'Mon', footfall: 120 },
  { day: 'Tue', footfall: 145 },
  { day: 'Wed', footfall: 110 },
  { day: 'Thu', footfall: 160 },
  { day: 'Fri', footfall: 195 },
  { day: 'Sat', footfall: 240 },
  { day: 'Sun', footfall: 210 },
]

const quickActions = [
  {
    icon: '📊',
    title: 'AI Stock Predictor',
    desc: 'Discover what products are in high demand this Spring season and what your customers want.',
    panel: 'recommendations',
  },
  {
    icon: '📷',
    title: 'Product Scanner',
    desc: 'Take a photo of any product to instantly find its wholesale price and nearby suppliers.',
    panel: 'scanner',
  },
  {
    icon: '🗺️',
    title: 'Supplier Map',
    desc: 'Find local Mandis, wholesale markets, and verified distributors within a 10km radius.',
    panel: 'map',
  },
]

const UPCOMING_FESTIVALS = ['Ugadi', 'Gudi Padwa']

const UNIVERSAL_ALERTS = [
  { type: 'warning', icon: '📈', title: 'Price Hike Alert: Edible Oils & Ghee', msg: 'Wholesale prices have increased by 8% in the last week due to upcoming festivals. Secure your bulk orders now before prices rise further.' },
  { type: 'success', icon: '📉', title: 'Price Drop: Seasonal Vegetables', msg: 'New crop arrivals have dropped prices by ₹5-8/kg in local APMC Mandis today. Great time to restock.' },
  { type: 'info',    icon: '☀️', title: 'Weather Impact: High Heat Expected', msg: 'Temperatures are rising. Expect a 40% surge in demand for cold beverages, ice creams, and dairy products this weekend.' },
  { type: 'success', icon: '💍', title: 'Wedding Season: Ethnic Wear Surge', msg: 'High demand for ethnic wear expected this weekend. Ensure stock of sarees, kurtas, and sherwanis.' },
  { type: 'info',    icon: '📱', title: 'Trending: Mobile Accessories', msg: 'Phone covers and chargers are seeing a 35% demand spike this week. Stock up from nearby wholesale markets.' },
]

const alertColors = {
  warning: 'bg-orange-50 border-orange-200 text-orange-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
}

export default function DashboardOverview({ onNavigate }) {
  const season = getCurrentSeason()
  const alerts = UNIVERSAL_ALERTS

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome to your Shop Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Get AI-driven market intelligence, wholesale rates, and stocking advice for your local business.
        </p>
      </div>

      {/* Festival Alert Banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-bold text-orange-800 text-sm">
              Upcoming Festivals: {UPCOMING_FESTIVALS.join(', ')}
            </p>
            <p className="text-orange-600 text-xs mt-0.5">
              Festivals bring a huge surge in customers. Don't wait until the last minute—stock up on puja items, sweets, and gifts now.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('recommendations')}
          className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg whitespace-nowrap"
        >
          Get Stock Ideas
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        {quickActions.map(action => (
          <button
            key={action.title}
            onClick={() => onNavigate && onNavigate(action.panel)}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-brand-50 transition-colors">
              {action.icon}
            </div>
            <h3 className="font-bold text-gray-900 text-sm">{action.title}</h3>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">{action.desc}</p>
          </button>
        ))}
      </div>

      {/* Alerts + Footfall Chart */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Mandi Market Alerts */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <h3 className="font-bold text-gray-800">Local Mandi &amp; Market Alerts</h3>
          </div>
          <div className="p-4 space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-3 border rounded-xl px-4 py-3 text-xs font-semibold ${alertColors[a.type]}`}>
                <span className="text-base shrink-0 mt-0.5">{a.icon}</span>
                <div>
                  <p className="font-bold text-xs">{a.title}</p>
                  <p className="font-normal mt-0.5 opacity-80 leading-relaxed">{a.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footfall Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-1">Expected Customer Footfall</h3>
          <p className="text-xs text-gray-400 mb-4">Based on local area analysis</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={footfallData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="footfall" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
