import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Eye, MousePointer, ShoppingBag, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { getAnalytics } from '../services/api';

const COLORS = ['#4c6ef5', '#7048e8', '#f06595', '#ffd43b', '#51cf66', '#ff6b6b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 text-xs" style={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsChart({ data: propData }) {
  const [data, setData] = useState(propData || null);
  const [loading, setLoading] = useState(!propData);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    if (propData) {
      setData(propData);
      return;
    }
    fetchData();
  }, [period, propData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAnalytics(period);
      setData(res);
    } catch (e) {
      console.error('Analytics fetch error:', e);
      // Use sample data as fallback
      setData(getSampleData());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const timeline = data?.timeline || [];
  const topItems = data?.top_items || [];
  const hourlyActivity = data?.hourly_activity || [];
  const eventBreakdown = data?.event_breakdown || {};

  // Pie chart data
  const pieData = Object.entries(eventBreakdown).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: 'Total Views', value: summary.total_views || 0, icon: Eye, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
    { label: 'Total Clicks', value: summary.total_clicks || 0, icon: MousePointer, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
    { label: 'Purchases', value: summary.total_purchases || 0, icon: ShoppingBag, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
    { label: 'Conversion', value: `${summary.conversion_rate || 0}%`, icon: TrendingUp, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setPeriod(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === d
                ? 'bg-primary-500 text-white'
                : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            {d}D
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <ArrowUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-400" />
            Activity Timeline
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4c6ef5" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4c6ef5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7048e8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#7048e8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="views" stroke="#4c6ef5" fill="url(#viewsGrad)" strokeWidth={2} name="Views" />
              <Area type="monotone" dataKey="clicks" stroke="#7048e8" fill="url(#clicksGrad)" strokeWidth={2} name="Clicks" />
              <Area type="monotone" dataKey="purchases" stroke="#51cf66" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Purchases" />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#71717a' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Event Breakdown Pie */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            Event Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#71717a' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Items */}
      {topItems.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary-400" />
            Top Performing Items
          </h3>
          <div className="space-y-3">
            {topItems.slice(0, 5).map((item, i) => (
              <motion.div
                key={item.catalog_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all"
              >
                <span className="text-xs font-bold text-white/30 w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.name || 'Item'}</p>
                  <p className="text-[10px] text-white/30">{item.category}</p>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-blue-400">{item.views} <span className="text-white/20">views</span></span>
                  <span className="text-purple-400">{item.clicks} <span className="text-white/20">clicks</span></span>
                  <span className="text-emerald-400">{item.purchases} <span className="text-white/20">buys</span></span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Hourly Activity */}
      {hourlyActivity.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-400" />
            Hourly Activity Pattern
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fill: '#71717a', fontSize: 10 }} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#4c6ef5" radius={[4, 4, 0, 0]} name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// Fallback sample data
function getSampleData() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().slice(0, 10),
      views: Math.floor(Math.random() * 50) + 20,
      clicks: Math.floor(Math.random() * 30) + 10,
      purchases: Math.floor(Math.random() * 10) + 2,
    });
  }
  return {
    summary: { total_views: 245, total_clicks: 128, total_purchases: 34, conversion_rate: 26.56, total_events: 450, total_searches: 43, total_bundle_clicks: 12 },
    timeline: days,
    top_items: [
      { catalog_id: '1', name: 'Bella Notte Trattoria', category: 'Restaurant', views: 45, clicks: 28, purchases: 12 },
      { catalog_id: '2', name: 'The Cozy Bean', category: 'Cafe', views: 38, clicks: 22, purchases: 8 },
      { catalog_id: '3', name: 'Spice Route Kitchen', category: 'Restaurant', views: 32, clicks: 18, purchases: 6 },
    ],
    hourly_activity: Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: Math.floor(Math.random() * 20) + 5 })),
    event_breakdown: { view: 245, click: 128, purchase: 34, search: 43 },
    period_days: 7,
  };
}
