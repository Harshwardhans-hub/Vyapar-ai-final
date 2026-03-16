import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons broken by Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:${color};border:2.5px solid #fff;
    box-shadow:0 1px 4px rgba(0,0,0,0.35)">
  </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#4f46e5;border:3px solid #fff;
    box-shadow:0 0 0 3px rgba(79,70,229,0.3)">
  </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const CATEGORY_COLORS = { business: '#4f46e5', cafe: '#f59e0b', service: '#10b981' }
const CATEGORY_ICONS  = { business: '🏢', cafe: '☕', service: '🔧' }

// Offsets relative to user location (degrees)
const BIZ_OFFSETS = [
  { id:1, name:'TechHub Coworking',    type:'Coworking',   category:'business', rating:4.7, promo:'20% off first month',        dlat: 0.002,  dlng: 0.003  },
  { id:2, name:'Brew & Code Café',     type:'Café',        category:'cafe',     rating:4.5, promo:'Free WiFi + loyalty card',    dlat:-0.0015, dlng: 0.002  },
  { id:3, name:'Metro Print Shop',     type:'Print',       category:'service',  rating:4.2, promo:'15% off bulk orders',         dlat: 0.003,  dlng:-0.004  },
  { id:4, name:'Nexus Networking Club',type:'Networking',  category:'business', rating:4.8, promo:'Free guest pass this week',   dlat:-0.002,  dlng:-0.003  },
  { id:5, name:'QuickShip Logistics',  type:'Logistics',   category:'service',  rating:4.3, promo:'Same-day delivery deal',      dlat: 0.004,  dlng: 0.001  },
  { id:6, name:'The Strategy Room',    type:'Consulting',  category:'business', rating:4.6, promo:'Free 30-min consultation',    dlat:-0.003,  dlng: 0.004  },
]

// Sub-component: re-centers map when position changes
function Recenter({ pos }) {
  const map = useMap()
  useEffect(() => { if (pos) map.setView(pos, 15) }, [pos, map])
  return null
}

export default function MapPanel() {
  const [userPos, setUserPos]   = useState(null)   // [lat, lng]
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [filter, setFilter]     = useState('all')
  const [selected, setSelected] = useState(null)
  const markerRefs              = useRef({})

  const DEFAULT_POS = [40.7128, -74.006] // NYC fallback

  const locate = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude])
        setLocating(false)
      },
      (err) => {
        setGeoError('Location access denied. Showing default map.')
        setUserPos(DEFAULT_POS)
        setLocating(false)
      },
      { timeout: 8000 }
    )
  }

  // Auto-locate on mount
  useEffect(() => { locate() }, [])

  const center = userPos || DEFAULT_POS

  const businesses = BIZ_OFFSETS.map(b => ({
    ...b,
    lat: center[0] + b.dlat,
    lng: center[1] + b.dlng,
  }))

  const filtered = filter === 'all' ? businesses : businesses.filter(b => b.category === filter)

  const handleListClick = (biz) => {
    setSelected(biz)
    const ref = markerRefs.current[biz.id]
    if (ref) ref.openPopup()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Map & Local Business Engagement</h2>
          <p className="text-gray-500 text-sm mt-1">Nearby businesses, local promotions and engagement opportunities</p>
        </div>
        <button onClick={locate} disabled={locating}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
          {locating
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <span>📍</span>}
          {locating ? 'Locating...' : 'Use My Location'}
        </button>
      </div>

      {geoError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-xl px-4 py-2">
          ⚠️ {geoError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Nearby Businesses', value: businesses.length, icon:'🏢' },
          { label:'Active Promotions',  value: businesses.filter(b=>b.promo).length, icon:'🎁' },
          { label:'Engagement Score',   value:'87%', icon:'📈' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <span className="text-2xl">{s.icon}</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['all','All'],['business','🏢 Business'],['cafe','☕ Café'],['service','🔧 Service']].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border
              ${filter === val
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400 hover:text-brand-600'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Map + list */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Leaflet Map */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 420 }}>
          <MapContainer center={center} zoom={15} style={{ width:'100%', height:'100%' }} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Recenter pos={userPos} />

            {/* User location */}
            {userPos && (
              <>
                <Marker position={userPos} icon={userIcon}>
                  <Popup><strong>You are here</strong></Popup>
                </Marker>
                <Circle center={userPos} radius={800}
                  pathOptions={{ color:'#4f46e5', fillColor:'#4f46e5', fillOpacity:0.06, weight:1.5 }} />
              </>
            )}

            {/* Business markers */}
            {filtered.map(biz => (
              <Marker
                key={biz.id}
                position={[biz.lat, biz.lng]}
                icon={makeIcon(CATEGORY_COLORS[biz.category])}
                ref={el => { if (el) markerRefs.current[biz.id] = el }}
                eventHandlers={{ click: () => setSelected(biz) }}
              >
                <Popup>
                  <div className="min-w-[160px]">
                    <p className="font-bold text-gray-900 text-sm">{biz.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{biz.type}</p>
                    <p className="text-xs mt-1">⭐ {biz.rating}</p>
                    {biz.promo && (
                      <p className="text-green-700 text-xs font-semibold mt-1.5 bg-green-50 px-2 py-1 rounded">
                        🎁 {biz.promo}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Business list */}
        <div className="space-y-2 overflow-y-auto max-h-[420px] pr-1">
          {filtered.map(biz => (
            <div key={biz.id}
              onClick={() => handleListClick(biz)}
              className={`bg-white rounded-xl p-4 border cursor-pointer transition-all hover:shadow-md
                ${selected?.id === biz.id ? 'border-brand-400 shadow-md' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{CATEGORY_ICONS[biz.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{biz.name}</p>
                  <p className="text-gray-400 text-xs">{biz.type}</p>
                  <p className="text-xs mt-1">⭐ {biz.rating}</p>
                  {biz.promo && (
                    <p className="text-xs text-green-600 font-medium mt-1.5 bg-green-50 px-2 py-0.5 rounded-full inline-block">
                      🎁 {biz.promo}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotions strip */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Active Local Promotions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {businesses.filter(b => b.promo).map(biz => (
            <div key={biz.id}
              className="bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{CATEGORY_ICONS[biz.category]}</span>
                <p className="font-semibold text-gray-900 text-sm">{biz.name}</p>
              </div>
              <p className="text-brand-700 text-sm font-medium">🎁 {biz.promo}</p>
              <button className="mt-3 text-xs font-semibold text-brand-600 hover:text-brand-800 border border-brand-200 hover:border-brand-400 px-3 py-1 rounded-lg transition-colors">
                Claim Offer →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
