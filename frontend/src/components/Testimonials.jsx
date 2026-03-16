const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'VP of Growth, RetailCo',
    avatar: 'SC',
    color: 'bg-pink-500',
    quote: 'SeasonAI cut our customer churn by 40% in the first quarter. The prediction engine flagged at-risk accounts we never would have caught manually.',
    rating: 5,
  },
  {
    name: 'Marcus Williams',
    role: 'CEO, FinTech Startup',
    avatar: 'MW',
    color: 'bg-blue-500',
    quote: 'The AI voice assistant alone saves my team hours every week. I just ask "What drove last week\'s dip?" and get a full breakdown instantly.',
    rating: 5,
  },
  {
    name: 'Priya Nair',
    role: 'Head of Analytics, LogiCorp',
    avatar: 'PN',
    color: 'bg-emerald-500',
    quote: 'We replaced three separate BI tools with SeasonAI. The unified dashboard and recommendation engine paid for itself in two months.',
    rating: 5,
  },
]

const stars = (n) => Array.from({ length: n }, (_, i) => (
  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
))

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-widest">Customer Stories</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
            Trusted by teams that move fast
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name}
              className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex gap-1">{stars(t.rating)}</div>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
