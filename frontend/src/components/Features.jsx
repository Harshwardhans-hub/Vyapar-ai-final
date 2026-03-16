const features = [
  {
    icon: '📊',
    title: 'AI Business Analytics',
    desc: 'Real-time dashboards powered by machine learning surface the KPIs that matter most, automatically.',
  },
  {
    icon: '🔮',
    title: 'Customer Behavior Prediction',
    desc: 'Anticipate what your customers will do next — before they do it — with predictive behavioral models.',
  },
  {
    icon: '🎯',
    title: 'Smart Recommendation Engine',
    desc: 'Seasonal, mood-aware recommendations powered by Gemini AI and vector search that increase conversions by 35%.',
  },
  {
    icon: '🎙️',
    title: 'AI Voice Assistant',
    desc: 'Query your business data hands-free. Ask questions in plain English using Web Speech API and get instant insights.',
  },
  {
    icon: '🗺️',
    title: 'Local Business Map',
    desc: 'Interactive map showing nearby businesses, active promotions, and engagement opportunities powered by Leaflet.',
  },
  {
    icon: '🌦️',
    title: 'Seasonal Intelligence',
    desc: 'Auto-detects current season and adjusts recommendations — Spring menus, Summer deals, Autumn comfort, Winter warmth.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-widest">What We Offer</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
            Everything your business needs to grow
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Six powerful AI modules working together to give you an unfair competitive advantage.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
