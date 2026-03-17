const features = [
  {
    icon: '🎯',
    title: 'AI Stock Predictor',
    desc: 'Tell us your business type and get AI-suggested products to stock for the upcoming season and local festivals — before your competitors do.',
  },
  {
    icon: '📸',
    title: 'Product Image Scanner',
    desc: 'Scan any product with your phone camera. Vyapar AI instantly identifies it and shows the best wholesale sources with live prices near you.',
  },
  {
    icon: '🗺️',
    title: 'Mandi & Supplier Map',
    desc: 'Interactive map showing real APMCs, wholesale mandis, and verified distributors within a 10km radius, with turn-by-turn routing.',
  },
  {
    icon: '🚀',
    title: 'Business Startup Guide',
    desc: 'Starting your first shop? Our AI walks you through licenses (GST, FSSAI), sourcing, pricing, and initial stocking step-by-step.',
  },
  {
    icon: '🎙️',
    title: 'Voice Business Assistant',
    desc: 'Speak your question in Hindi or English. Ask about mandi rates, trending items, or festival stocking — get instant AI answers.',
  },
  {
    icon: '🌦️',
    title: 'Festival & Season Alerts',
    desc: 'Auto-detects upcoming festivals (Holi, Diwali, Ugadi) and sends stocking alerts so you never miss a surge in demand.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gradient-to-br from-brand-900 via-indigo-900 to-brand-800 border-t border-brand-800 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-300 font-semibold text-sm uppercase tracking-widest bg-brand-500/20 px-4 py-1.5 rounded-full backdrop-blur-sm border border-brand-400/30">Built for Retailers &amp; Vendors</span>
          <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Everything your shop needs <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-300">to increase profits</span>
          </h2>
          <p className="mt-6 text-lg text-indigo-200 max-w-2xl mx-auto">
            Six advanced AI tools custom-made for the daily struggles and opportunities of Indian shop owners.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 hover:border-brand-400 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-400/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-brand-400/20 transition-all duration-300"></div>

              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-3xl mb-6 shadow-inner border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="relative z-10 text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="relative z-10 text-indigo-100 text-sm leading-relaxed opacity-90">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
