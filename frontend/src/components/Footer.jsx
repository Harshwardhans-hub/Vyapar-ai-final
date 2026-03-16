const links = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Resources: ['Docs', 'API Reference', 'Status', 'Community'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
}

export default function Footer() {
  return (
    <footer id="contact" className="bg-brand-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl text-white">SeasonAI</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              AI-powered seasonal business intelligence for the modern enterprise.
            </p>
            <div className="mt-4 flex gap-3">
              {['twitter', 'linkedin', 'github'].map(s => (
                <a key={s} href="#"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <span className="text-xs text-gray-300 capitalize">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 SeasonAI Inc. All rights reserved.</p>
          <a href="mailto:hello@seasonai.io"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            hello@seasonai.io
          </a>
        </div>
      </div>
    </footer>
  )
}
