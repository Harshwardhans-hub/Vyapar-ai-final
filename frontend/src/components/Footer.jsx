const links = {
  Product:   ['Features', 'Pricing', 'Scanner App', 'Mandi Locator'],
  Company:   ['About Us', 'Success Stories', 'Contact', 'Press'],
  Resources: ['Shop Startup Guide', 'Wholesaler Directory', 'WhatsApp Support', 'Community'],
  Legal:     ['Privacy', 'Terms', 'Security', 'Refunds'],
}

export default function Footer() {
  return (
    <footer id="contact" className="bg-brand-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-bold text-xl text-white">Vyapar AI</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              AI-powered seasonal retail intelligence for Indian local shops, vendors, and small entrepreneurs.
            </p>
            <div className="mt-4 flex gap-3">
              {['T', 'L', 'F'].map(s => (
                <a key={s} href="#"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <span className="text-xs text-gray-300 font-bold">{s}</span>
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
          <p className="text-sm text-gray-500">© 2026 Vyapar AI. Empowering Local Business.</p>
          <a href="mailto:hello@vyapar.ai"
            className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
            hello@vyapar.ai
          </a>
        </div>
      </div>
    </footer>
  )
}
