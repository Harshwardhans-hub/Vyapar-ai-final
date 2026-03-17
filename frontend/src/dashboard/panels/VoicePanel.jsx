import { useState, useEffect, useRef, useCallback } from 'react'
import { sendChatMessage } from '../../services/api'

const SAMPLE_QUERIES = [
  "What should I stock for Holi festival?",
  "Best wholesale market for vegetables near me",
  "How to start a kirana shop?",
  "Which products have highest profit margin?",
  "What is trending to sell this spring?",
  "Where to buy electronics wholesale?",
  "How to get FSSAI license?",
  "Best items to sell during summer season",
]

export default function VoicePanel() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const [lang, setLang] = useState('en-IN')
  const [supported, setSupported] = useState(true)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef(null)

  const buildRecognition = useCallback((currentLang) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setSupported(false); return null }
    const r = new SR()
    r.continuous = false
    r.interimResults = true
    r.maxAlternatives = 3
    r.lang = currentLang || 'en-IN'
    r.onstart = () => { setListening(true); setError(''); setInterimText('') }
    r.onresult = (e) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      setInterimText(interim)
      if (final) { 
        setQuery(final); 
        setInterimText(''); 
        if (recognitionRef.current) recognitionRef.current.stop();
        handleAsk(final);
      }
    }
    r.onerror = (e) => {
      setListening(false); setInterimText('')
      const msgs = {
        'no-speech': 'No speech detected. Please speak clearly.',
        'audio-capture': 'Microphone not found. Check device settings.',
        'not-allowed': 'Microphone access denied. Allow it in browser settings.',
        'network': 'Network error. Check your connection.',
      }
      if (e.error !== 'aborted') setError(msgs[e.error] || ('Voice error: ' + e.error))
    }
    r.onend = () => { setListening(false); setInterimText('') }
    return r
  }, [])

  useEffect(() => {
    recognitionRef.current = buildRecognition(lang)
    return () => { if (recognitionRef.current) recognitionRef.current.abort() }
  }, [lang, buildRecognition])

  const toggleListen = () => {
    if (!supported) { setError('Voice recognition requires Chrome or Edge browser.'); return }
    if (listening) {
      if (recognitionRef.current) recognitionRef.current.stop()
    } else {
      setError(''); setResponse('')
      recognitionRef.current = buildRecognition(lang)
      try { if (recognitionRef.current) recognitionRef.current.start() }
      catch (err) { setError('Could not start microphone. Please try again.') }
    }
  }

  const handleAsk = async (text) => {
    const q = (text || query).trim()
    if (!q) return
      setQuery(q); setLoading(true); setResponse(''); setError('')
      
      // Stop anything currently speaking
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      
      try {
        const data = await sendChatMessage(q, { source: 'voice_panel', language: lang === 'hi-IN' ? 'hindi' : 'english' })
        const resText = data.response || 'No response received.'
        setResponse(resText)
        
        // Read response realistically
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(resText)
          utterance.lang = lang === 'hi-IN' ? 'hi-IN' : 'en-IN'
          // Optionally pick a specific voice if available
          window.speechSynthesis.speak(utterance)
        }
      } catch (err) {
        setError('AI service is temporarily unavailable. Please try again.')
      } finally { setLoading(false) }
  }

  const toggleLang = () => {
    if (recognitionRef.current) recognitionRef.current.abort()
    setLang(function(prev) { return prev === 'en-IN' ? 'hi-IN' : 'en-IN' })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Vyapar Voice Assistant</h2>
        <p className="text-gray-600 text-sm mt-2 font-semibold">Speak your business queries in Hindi or English</p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <button onClick={toggleLang} className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-full font-bold transition-all">
            {lang === 'en-IN' ? 'English (India) — Switch to Hindi' : 'Hindi — Switch to English'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60" />
        <button onClick={toggleListen} disabled={!supported}
          className={['relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed', listening ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-700'].join(' ')}>
          {listening && <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />}
          <svg className="w-10 h-10 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm0 2a2 2 0 00-2 2v6a2 2 0 004 0V5a2 2 0 00-2-2zm-7 9a7 7 0 0014 0h2a9 9 0 01-8 8.94V23h-2v-2.06A9 9 0 013 12H5z" />
          </svg>
        </button>

        <div className="text-center min-h-[44px]">
          {listening ? (
            <div>
              <p className="text-red-500 font-black text-lg animate-pulse">{lang === 'hi-IN' ? 'Sun raha hoon...' : 'Listening...'}</p>
              {interimText && <p className="text-gray-500 text-sm mt-1 italic">"{interimText}"</p>}
            </div>
          ) : (
            <div>
              <p className="text-gray-900 font-black text-lg">{lang === 'hi-IN' ? 'Bolne ke liye tap karein' : 'Tap to Speak'}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-widest">Try: "{SAMPLE_QUERIES[0]}"</p>
            </div>
          )}
        </div>

        <div className="w-full flex gap-3 bg-gray-100 p-2 rounded-2xl border border-gray-200">
          <input value={query} onChange={function(e) { setQuery(e.target.value) }}
            onKeyDown={function(e) { if (e.key === 'Enter') handleAsk() }}
            placeholder={lang === 'hi-IN' ? 'Yahan type karein ya bolein...' : 'Type here or speak your question...'}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 font-semibold focus:outline-none placeholder:text-gray-400 placeholder:font-normal" />
          <button onClick={function() { handleAsk() }} disabled={loading || !query.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-black transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Thinking...' : (lang === 'hi-IN' ? 'Puchein' : 'Ask AI')}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-5 py-4 rounded-2xl flex items-start gap-3">
          <span className="text-lg">Warning: </span><span>{error}</span>
        </div>
      )}

      {(loading || response) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg relative overflow-hidden">
          <div className="absolute -top-3 left-8 bg-indigo-600 text-xs font-black text-white px-3 py-1 rounded-full uppercase tracking-widest">AI Insights</div>
          <div className="p-8 pt-10">
            {loading ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-500">Gemini AI is analyzing your query...</p>
              </div>
            ) : (
              <>
                <div className="text-gray-800 leading-relaxed font-medium text-sm whitespace-pre-wrap">{response}</div>
                <button onClick={() => {
                  if ('speechSynthesis' in window) {
                     window.speechSynthesis.cancel();
                  }
                }} className="mt-4 text-xs font-bold text-red-500 hover:text-red-700 underline">Stop Audio</button>
              </>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest text-center mb-4">Common Questions — Click to Ask</p>
        <div className="flex flex-wrap justify-center gap-3">
          {SAMPLE_QUERIES.map(function(q) {
            return (
              <button key={q} onClick={function() { handleAsk(q) }} disabled={loading}
                className="text-xs bg-white hover:bg-indigo-600 text-gray-700 hover:text-white px-5 py-2.5 rounded-2xl transition-all border border-gray-200 hover:border-indigo-600 shadow-sm font-semibold disabled:opacity-50">
                {q}
              </button>
            )
          })}
        </div>
      </div>

      {!supported && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800 font-semibold text-center">
          Voice recognition requires Chrome or Edge. You can still type your questions above.
        </div>
      )}
    </div>
  )
}
