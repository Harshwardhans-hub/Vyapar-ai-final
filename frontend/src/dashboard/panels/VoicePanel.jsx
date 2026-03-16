import { useState } from 'react'
import { sendChatMessage } from '../../services/api'

const sampleQueries = [
  "What are the best romantic restaurants this spring?",
  "Show me budget-friendly cafes nearby",
  "Find cozy dinner spots for a date night",
  "What local businesses have seasonal promotions?",
]

export default function VoicePanel() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)

  const ask = async (q) => {
    const text = q || query
    if (!text.trim()) return
    setQuery(text)
    setLoading(true)
    setResponse('')
    try {
      const data = await sendChatMessage(text, { source: 'voice_panel' })
      setResponse(data.response || 'No response from AI.')
    } catch {
      setResponse('AI service is temporarily unavailable. Please try again.')
    }
    setLoading(false)
  }

  const toggleListen = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setResponse('Speech recognition is not supported in your browser. Try Chrome.')
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      ask(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.start()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI Voice Assistant</h2>
        <p className="text-gray-500 text-sm mt-1">Ask questions about local businesses in plain English — powered by Gemini AI</p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center gap-6">
        <button
          onClick={toggleListen}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
            listening
              ? 'bg-red-500 animate-pulse scale-110'
              : 'bg-brand-600 hover:bg-brand-700'
          }`}
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm0 2a2 2 0 00-2 2v6a2 2 0 004 0V5a2 2 0 00-2-2zm-7 9a7 7 0 0014 0h2a9 9 0 01-8 8.94V23h-2v-2.06A9 9 0 013 12H5z" />
          </svg>
        </button>
        <p className="text-sm text-gray-400">{listening ? 'Listening...' : 'Click mic or type below'}</p>

        <div className="w-full flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && ask()}
            placeholder="Ask anything about local businesses..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button onClick={() => ask()} disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
            {loading ? '...' : 'Ask'}
          </button>
        </div>
      </div>

      {(loading || response) && (
        <div className="bg-white rounded-xl p-6 border border-brand-100 shadow-sm">
          {loading
            ? <div className="flex items-center gap-3 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                Analyzing with Gemini AI...
              </div>
            : <p className="text-gray-700 leading-relaxed">{response}</p>
          }
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Try asking</p>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map(q => (
            <button key={q} onClick={() => ask(q)}
              className="text-xs bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-600 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-brand-200">
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
