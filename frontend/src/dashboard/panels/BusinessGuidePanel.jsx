import { useState } from 'react'
import { api } from '../../services/api'
import ReactMarkdown from 'react-markdown'

export default function BusinessGuidePanel() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Namaste! I am Vyapar AI. Whether you are already running a shop or planning to start a new business, I can help you with steps, licenses (GST/FSSAI), and sourcing hubs. How can I help you today?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPlan, setShowPlan] = useState(false)

  const handleStartPlan = () => {
    setLoading(true)
    setTimeout(() => {
      handleSend(null, `Create a 30-day comprehensive business startup plan for me step-by-step.`)
      setShowPlan(true)
      setLoading(false)
    }, 1000)
  }

  const handleSend = async (e, customMsg) => {
    if (e) e.preventDefault()
    const msg = customMsg || input
    if (!msg.trim()) return

    const userMsg = { role: 'user', text: msg }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/api/chat', { 
        message: msg,
        context: { source: 'startup_guide' }
      })
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I am having trouble connecting. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    "Steps to start a new business",
    "Where to buy wholesale inventory nearby?",
    "License & GST requirements for shops",
    "Upcoming festival market trends",
    "How to manage shop expenses?"
  ]

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Vyapar Mentor AI</h2>
          <p className="text-gray-500 text-sm mt-2 max-w-md italic font-medium">"Your personal business coach for the local market."</p>
          
          <div className="mt-6 flex flex-wrap gap-2">
            {quickPrompts.map(p => (
              <button key={p} onClick={() => handleSend(null, p)}
                className="text-[11px] font-bold bg-white text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm hover:shadow-indigo-200">
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 grayscale">🚀</div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white text-xs font-black uppercase tracking-widest">Mentor Online</span>
          </div>
          <button onClick={() => setMessages([{ role: 'assistant', text: `Chat cleared. How else can I help with your business?` }])}
            className="text-[10px] font-bold text-indigo-200 hover:text-white uppercase">
            Clear Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none font-medium'
              }`}>
                {m.role === 'user' ? (
                  m.text
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-3 mb-2 text-indigo-900" {...props} />,
                      h4: ({node, ...props}) => <h4 className="text-base font-bold mt-2 mb-1 text-indigo-800" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          <div id="chat-end" />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask about licensing, sourcing, startup steps...`}
            className="flex-1 bg-gray-100 border border-gray-200 rounded-2xl px-5 py-3.5 text-sm text-gray-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
          />
          <button type="submit" disabled={loading}
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200 disabled:opacity-50">
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>

      <div className="bg-indigo-900 rounded-3xl p-8 text-white overflow-hidden relative group">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black italic tracking-tight">Business Launch Plan</h3>
            <p className="text-indigo-200 text-sm mt-1 font-medium">Get your step-by-step roadmap + mapping for wholesale hubs.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleStartPlan}
              disabled={loading}
              className="bg-white text-indigo-900 px-6 py-3 rounded-2xl text-xs font-black shadow-xl hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50">
              {loading ? 'Consulting AI...' : 'Start My Business Guide 🚀'}
            </button>
          </div>
        </div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500 opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
      </div>
    </div>
  )
}
