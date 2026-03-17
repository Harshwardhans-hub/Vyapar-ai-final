import { useState, useRef } from 'react'
import axios from 'axios'

export default function ProductScannerPanel() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [selectedSource, setSelectedSource] = useState(null)
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    setResult(null)
    setError(null)
    setImage(file)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const scan = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSelectedSource(null)
    
    try {
      const formData = new FormData()
      formData.append('image', image)
      
      // Get user's location if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            formData.append('location', `${position.coords.latitude},${position.coords.longitude}`)
            await performScan(formData)
          },
          async () => {
            // Location denied, proceed without it
            await performScan(formData)
          }
        )
      } else {
        await performScan(formData)
      }
    } catch (err) {
      handleScanError(err)
      setLoading(false)
    }
  }

  const performScan = async (formData) => {
    try {
      const res = await axios.post('/api/scan-product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      })
      
      if (res.data.category === 'Error' || res.data.product_name === 'Error') {
        setError(res.data.description || 'Failed to analyze image. Please try again.')
        setResult(null)
      } else if (res.data.product_name === 'Service Temporarily Unavailable') {
        setError('⚠️ AI service is temporarily at capacity. Please wait a moment and try again.')
        setResult(res.data)
      } else {
        setResult(res.data)
        // Auto-select first source
        if (res.data.wholesale_sources && res.data.wholesale_sources.length > 0) {
          setSelectedSource(res.data.wholesale_sources[0])
        }
      }
    } catch (err) {
      handleScanError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleScanError = (err) => {
    console.error('Product scan error:', err)
    const errorMsg = err.response?.data?.error || err.message
    
    if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      setError('⚠️ AI service quota exceeded. Please wait 1-2 minutes and try again.')
    } else if (err.code === 'ECONNABORTED' || errorMsg.includes('timeout')) {
      setError('⏱️ Request timed out. Please try a smaller image.')
    } else {
      setError('Failed to analyze image. Please check your connection and try again.')
    }
  }

  const clear = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setSelectedSource(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const openInMaps = (source) => {
    const query = source.map_search || source.search_keyword || `${source.name} ${source.location}`
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          📷 Smart Product Scanner
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Upload any product image → AI identifies it → Get wholesale prices & nearby suppliers with map locations
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Panel */}
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center min-h-[320px] relative">
          {!preview ? (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-xl"
              onDragOver={e => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center border border-brand-200 text-4xl">
                📸
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 text-sm">Drop image here or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • Max 5MB</p>
              </div>
              <button className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md">
                Choose Image
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            </div>
          ) : (
            <>
              <img src={preview} alt="product" className="max-h-[260px] max-w-full object-contain rounded-2xl shadow-lg" />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            </>
          )}

          {preview && (
            <button
              onClick={clear}
              className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors shadow-lg"
            >
              ×
            </button>
          )}
        </div>

        {/* Actions + Quick Results */}
        <div className="flex flex-col gap-4">
          {preview && (
            <div className="flex gap-3">
              <button
                onClick={scan}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 disabled:opacity-60 text-white font-black py-3.5 rounded-2xl transition-all active:scale-95 shadow-lg shadow-brand-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Scan Product
                  </>
                )}
              </button>
              <button
                onClick={clear}
                className="px-5 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 font-semibold text-sm transition-all rounded-xl"
              >
                Clear
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3 text-red-700 text-sm">
              <span className="text-xl shrink-0">⚠️</span>
              <div>{error}</div>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-100 rounded-xl w-full" style={{ width: `${100 - i * 15}%` }}></div>
                </div>
              ))}
            </div>
          )}

          {result && result.product_name && result.product_name !== 'Error' && (
            <div className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl px-5 py-4 border border-brand-100">
              <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">✓ Identified</p>
              <p className="font-black text-gray-900 text-lg">{result.product_name}</p>
              {result.brand && result.brand !== 'N/A' && (
                <p className="text-xs text-gray-600 mt-0.5">Brand: {result.brand}</p>
              )}
              <p className="text-gray-600 text-xs mt-2 leading-relaxed">{result.description}</p>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {result.retail_price_range && result.retail_price_range !== 'N/A' && (
                  <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Retail Price</p>
                    <p className="text-sm font-black text-gray-800">{result.retail_price_range}</p>
                  </div>
                )}
                {result.wholesale_price_range && result.wholesale_price_range !== 'N/A' && (
                  <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Wholesale Price</p>
                    <p className="text-sm font-black text-green-600">{result.wholesale_price_range}</p>
                  </div>
                )}
                {result.profit_margin && result.profit_margin !== 'N/A' && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg px-3 py-2 border border-blue-100 shadow-sm">
                    <p className="text-[9px] text-blue-700 font-bold uppercase tracking-wider mb-0.5">Est. Margin</p>
                    <p className="text-sm font-black text-blue-700">{result.profit_margin}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!preview && !result && (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-3 py-12">
              <span className="text-5xl">🔍</span>
              <p className="font-semibold text-sm">Upload a product image</p>
              <p className="text-xs px-4">AI will identify it and show wholesale sources with prices and map locations</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Results */}
      {result && result.wholesale_sources && result.wholesale_sources.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Wholesale Sources List */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white">
              <p className="text-xs font-black uppercase tracking-widest">Wholesale Sources ({result.wholesale_sources.length})</p>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {result.wholesale_sources.map((source, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedSource(source)}
                  className={`px-5 py-4 border-b border-gray-50 last:border-0 cursor-pointer transition-all ${
                    selectedSource === source ? 'bg-brand-50 border-l-4 border-l-brand-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{source.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{source.source_type}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        📍 {source.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-black text-green-600 text-sm">{source.estimated_price}</p>
                    {source.distance && source.distance !== 'N/A' && (
                      <p className="text-xs text-gray-400">{source.distance}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map & Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Embedded Map */}
            {selectedSource && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest">📍 Map Location</p>
                  <button
                    onClick={() => openInMaps(selectedSource)}
                    className="text-xs bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg font-bold transition-all"
                  >
                    Open in Google Maps →
                  </button>
                </div>
                <div className="relative w-full h-[300px]">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                      selectedSource.map_search || selectedSource.search_keyword || `${selectedSource.name} ${selectedSource.location}`
                    )}`}
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="px-5 py-4 bg-gray-50">
                  <p className="text-xs font-bold text-gray-700 mb-2">💡 Buying Tip:</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{selectedSource.tip}</p>
                  {selectedSource.best_time && selectedSource.best_time !== 'N/A' && (
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-bold">Best Time:</span> {selectedSource.best_time}
                    </p>
                  )}
                  {selectedSource.contact && selectedSource.contact !== 'N/A' && (
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-bold">Contact:</span> {selectedSource.contact}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-4">
              {result.quality_tips && result.quality_tips.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl px-5 py-4">
                  <p className="text-xs font-black text-yellow-800 uppercase tracking-widest mb-2">✓ Quality Tips</p>
                  <ul className="space-y-1.5">
                    {result.quality_tips.map((tip, i) => (
                      <li key={i} className="text-xs text-yellow-700 flex items-start gap-2">
                        <span className="shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.storage_tips && result.storage_tips !== 'N/A' && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
                  <p className="text-xs font-black text-blue-800 uppercase tracking-widest mb-2">📦 Storage Tips</p>
                  <p className="text-xs text-blue-700 leading-relaxed">{result.storage_tips}</p>
                </div>
              )}

              {result.best_season && result.best_season !== 'All seasons' && (
                <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
                  <p className="text-xs font-black text-green-800 uppercase tracking-widest mb-2">🌤️ Best Season</p>
                  <p className="text-xs text-green-700">{result.best_season}</p>
                </div>
              )}

              {result.demand_trend && result.demand_trend !== 'N/A' && (
                <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4">
                  <p className="text-xs font-black text-purple-800 uppercase tracking-widest mb-2">📈 Demand Trend</p>
                  <p className="text-xs text-purple-700">{result.demand_trend}</p>
                </div>
              )}
            </div>

            {result.business_advice && result.business_advice !== 'N/A' && (
              <div className="bg-gradient-to-br from-brand-50 to-purple-50 border border-brand-100 rounded-2xl px-5 py-4">
                <p className="text-xs font-black text-brand-700 uppercase tracking-widest mb-2">💼 Business Advice</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.business_advice}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
