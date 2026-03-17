import { useState, useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:${color};border:3px solid #fff;
    box-shadow:0 2px 5px rgba(0,0,0,0.4)">
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#4f46e5;border:3px solid #fff;
    box-shadow:0 0 0 4px rgba(79,70,229,0.3)">
  </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

// Recenter map when position changes
function Recenter({ pos }) {
  const map = useMap()
  useEffect(() => { 
    if (pos && map) {
      map.setView(pos, map.getZoom(), { animate: true })
    }
  }, [pos, map])
  return null
}

const DEFAULT_POS = [22.7196, 75.8577] // Indore fallback location

export default function MapPanel() {
  const [userPos, setUserPos] = useState(null)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [places, setPlaces] = useState([])
  const [loadingPlaces, setLoadingPlaces] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [routingLoading, setRoutingLoading] = useState(false)
  const [searchType, setSearchType] = useState(localStorage.getItem('mapSearchType') || 'marketplace') // marketplace, wholesale, shop, custom
  const [customQuery, setCustomQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  
  const markerRefs = useRef({})

  // 1. Geolocation
  const locate = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      setUserPos(DEFAULT_POS)
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
        setGeoError('Location access denied or failed. Showing default map (Delhi).')
        setUserPos(DEFAULT_POS)
        setLocating(false)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  useEffect(() => { locate() }, [])

  // 2. Fetch Nearby Places (Overpass API)
  const searchNearby = async () => {
    const center = userPos || DEFAULT_POS
    setLoadingPlaces(true)
    setPlaces([])
    setRouteCoordinates([])
    setSelectedPlace(null)

    try {
      const radiusParams = 25000 // 25km radius to cover pan Indore city
      let queryTag = ''
      
      // Specifically target wholesale, mandis, distributors, and sourcing hubs
      if (searchType === 'vegetables') {
        queryTag = `nwr["amenity"="marketplace"](around:${radiusParams},${center[0]},${center[1]}); nwr["shop"~"greengrocer|farm|vegetables|fruit"](around:${radiusParams},${center[0]},${center[1]}); nwr["wholesale"~"fruits|vegetables"](around:${radiusParams},${center[0]},${center[1]});`
      } else if (searchType === 'farming') {
        queryTag = `nwr["shop"~"farm|agrochemical|tractor|agrarian|dairy"](around:${radiusParams},${center[0]},${center[1]}); nwr["wholesale"~"agricultural|farm|seeds"](around:${radiusParams},${center[0]},${center[1]}); nwr["name"~"farm|organic|seeds|krishi",i](around:${radiusParams},${center[0]},${center[1]});`
      } else if (searchType === 'electronics') {
        queryTag = `nwr["wholesale"="electronics"](around:${radiusParams},${center[0]},${center[1]}); nwr["shop"~"electronics|computer|mobile|electrical"](around:${radiusParams},${center[0]},${center[1]});`
      } else if (searchType === 'clothes') {
        queryTag = `nwr["wholesale"~"clothes|fabric"](around:${radiusParams},${center[0]},${center[1]}); nwr["shop"~"clothes|fabric|boutique|tailor|shoes"](around:${radiusParams},${center[0]},${center[1]});`
      } else if (searchType === 'grocery') {
        queryTag = `nwr["wholesale"~"grocery|fmcg|dry_goods"](around:${radiusParams},${center[0]},${center[1]}); nwr["shop"~"supermarket|convenience|grocery|dairy|general"](around:${radiusParams},${center[0]},${center[1]});`
      } else if (searchType === 'custom' && customQuery) {
        // Smart Semantic Keyword Parser for Human-like Search
        const stopWords = ['i', 'want', 'need', 'some', 'any', 'the', 'a', 'an', 'for', 'of', 'in', 'to', 'products', 'supplier', 'suppliers', 'wholesale', 'wholesalers', 'shop', 'store', 'business', 'items', 'dealer', 'distributor', 'distributors', 'and'];
        const cleanQuery = customQuery.toLowerCase().replace(/[^a-z0-9 ]/g, '');
        let words = cleanQuery.split(' ').filter(w => w.length > 2 && !stopWords.includes(w));
        
        // If everything was filtered out, fallback to the original string
        if (words.length === 0) words = [cleanQuery];
        
        // Smart Synonym Expansion (makes the system hyper-realistic)
        const expandedTerms = new Set(words);
        words.forEach(word => {
            if (['farm', 'farming', 'agriculture', 'organic'].includes(word)) { expandedTerms.add('agri').add('seed').add('fertilizer').add('tractor').add('farm').add('organic'); }
            if (['hardware', 'tools', 'pipe', 'cement'].includes(word)) { expandedTerms.add('build').add('steel').add('iron').add('paint').add('electrical').add('plastic'); }
            if (['medical', 'medicine', 'pharma', 'health'].includes(word)) { expandedTerms.add('chemist').add('surgical').add('pharmacy').add('hospital'); }
            if (['tech', 'computer', 'mobile', 'laptop'].includes(word)) { expandedTerms.add('electronic').add('it').add('digital').add('software'); }
            if (['food', 'restaurant', 'cafe'].includes(word)) { expandedTerms.add('grocery').add('supermarket').add('fmcg').add('bakery'); }
            if (['plastic', 'polymer'].includes(word)) { expandedTerms.add('packaging').add('pvc').add('bottle').add('box'); }
        });

        // Create a flexible OR regex pattern (e.g. "organic|farm|agri")
        const regexStr = Array.from(expandedTerms).join('|');

        // Broad search using the smart regex specifically targeting wholesale/distributors
        queryTag = `
          nwr["wholesale"~"${regexStr}",i](around:${radiusParams},${center[0]},${center[1]});
          nwr["shop"="wholesale"]["name"~"${regexStr}",i](around:${radiusParams},${center[0]},${center[1]});
          nwr["name"~"${regexStr}",i]["wholesale"](around:${radiusParams},${center[0]},${center[1]});
          nwr["name"~"wholesale|distributor|dealer|agency|agencies",i]["name"~"${regexStr}",i](around:${radiusParams},${center[0]},${center[1]});
        `
      } else {
        queryTag = `nwr["wholesale"](around:${radiusParams},${center[0]},${center[1]}); nwr["amenity"="marketplace"](around:${radiusParams},${center[0]},${center[1]});`
      }

      // We use a simple Overpass QL query, added out center to get ways center lat/lon
      const query = `[out:json][timeout:25];(${queryTag});out center 50;`
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'data=' + encodeURIComponent(query)
      })
      
      if (!res.ok) throw new Error('Failed to fetch from Overpass API')
      const data = await res.json()
      
      const mappedPlaces = (data.elements || [])
        .filter(el => el.lat || el.center?.lat) // Avoid crashing on undefined coordinates
        .map(el => ({
          id: el.id,
          lat: el.lat || el.center.lat,
          lng: el.lon || el.center.lon,
          name: el.tags?.name || (searchType === 'marketplace' ? 'Local Mandi / Market' : 'Local Wholesale Supplier'),
          type: String(el.tags?.shop || el.tags?.wholesale || el.tags?.amenity || searchType),
          distance: calculateDistance(center[0], center[1], el.lat || el.center.lat, el.lon || el.center.lon),
        })).sort((a,b) => parseFloat(a.distance) - parseFloat(b.distance))

      setPlaces(mappedPlaces)
    } catch (err) {
      setGeoError('Could not fetch nearby places. Please try searching again.')
      console.error(err)
    } finally {
      setLoadingPlaces(false)
    }
  }

  // Auto search when position or search type or custom query changes
  useEffect(() => {
    if (userPos && (searchType !== 'custom' || customQuery)) searchNearby()
  }, [userPos, searchType, customQuery])

  const handleCustomSearch = (e) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    setCustomQuery(searchInput.trim())
    setSearchType('custom')
    localStorage.setItem('mapSearchType', 'custom')
  }

  // 3. Routing (OSRM API)
  const getRoute = async (destination) => {
    if (!userPos) return
    setRoutingLoading(true)
    setRouteCoordinates([])
    try {
      // OSRM expects coordinates as lon,lat
      const start = `${userPos[1]},${userPos[0]}`
      const end = `${destination.lng},${destination.lat}`
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`)
      const data = await res.json()
      
      if (data.routes && data.routes.length > 0) {
        // GeoJSON uses [lon, lat], Leaflet wants [lat, lon]
        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]])
        setRouteCoordinates(coords)
      }
    } catch (err) {
      console.error("Routing error:", err)
      setGeoError("Couldn't calculate route.")
    } finally {
      setRoutingLoading(false)
    }
  }

  // Helpers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  }

  const handleListClick = (place) => {
    setSelectedPlace(place)
    const ref = markerRefs.current[place.id]
    if (ref) ref.openPopup()
    getRoute(place)
  }

  const center = userPos || DEFAULT_POS

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sourcing & Supplier Map</h2>
          <p className="text-gray-500 text-sm mt-1">Find nearby mandis, wholesale markets, and suppliers for your business</p>
        </div>
        <button onClick={locate} disabled={locating}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
          {locating
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <span>📍</span>}
          {locating ? 'Locating...' : 'My Location'}
        </button>
      </div>

      {geoError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          <span>⚠️ {geoError}</span>
          <button onClick={() => setGeoError('')} className="text-yellow-800 hover:text-yellow-900 font-bold">×</button>
        </div>
      )}

      {/* Filter tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-black uppercase text-gray-400 tracking-wider mr-2">Top Wholesale Categories</span>
          {[
            ['vegetables','🧅 Vegetables & Fruits'],
            ['farming','🌾 Farming Products'],
            ['grocery','🥫 Local Grocery Stores'],
            ['clothes','👗 Cloth & Garments'],
            ['electronics','💻 Electronics Business']
          ].map(([val,label]) => (
            <button key={val} onClick={() => { setSearchType(val); setCustomQuery(''); localStorage.setItem('mapSearchType', val); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border shadow-sm
                ${searchType === val
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400 hover:text-brand-600'}`}>
              {label}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleCustomSearch} className="flex relative min-w-[250px]">
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search B2B Suppliers (e.g. Footwear, Hardware)..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-100 text-brand-600 p-1.5 rounded-lg hover:bg-brand-200 transition-colors">
            🔍
          </button>
        </form>
      </div>

      {/* Map + list */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0" style={{ height: 500 }}>
          {center && (
            <MapContainer 
              center={center} 
              zoom={13} 
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Recenter pos={center} />

              {userPos && (
                <Marker position={userPos} icon={userIcon}>
                  <Popup><strong>You are here</strong></Popup>
                </Marker>
              )}
              
              {userPos && (
                <Circle center={userPos} radius={25000}
                  pathOptions={{ color:'#4f46e5', fillColor:'#4f46e5', fillOpacity:0.04, weight:1 }} />
              )}

              {places.map(place => (
                <Marker
                  key={place.id}
                  position={[place.lat, place.lng]}
                  icon={makeIcon(selectedPlace?.id === place.id ? '#10b981' : '#f59e0b')}
                  ref={el => { if (el) markerRefs.current[place.id] = el }}
                  eventHandlers={{ click: () => { setSelectedPlace(place); getRoute(place); } }}
                >
                  <Popup>
                    <div className="min-w-[150px]">
                      <p className="font-bold text-gray-900 text-sm">{place.name}</p>
                      <p className="text-gray-500 text-xs capitalize mt-0.5">{String(place.type).replace(/_/g,' ')}</p>
                      <p className="text-blue-600 font-semibold text-xs mt-1.5">{place.distance} km away</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {routeCoordinates.length > 0 && (
                <Polyline positions={routeCoordinates} color="#4f46e5" weight={5} opacity={0.7} />
              )}
            </MapContainer>
          )}

          {/* Loading Overlay */}
          {(loadingPlaces || routingLoading) && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-md z-[1000] flex items-center gap-2 border border-gray-100">
               <span className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
               <span className="text-sm font-semibold text-brand-700">
                 {loadingPlaces ? "Searching area..." : "Calculating route..."}
               </span>
            </div>
          )}
        </div>

        {/* Places list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: 500 }}>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
            <h3 className="font-bold text-gray-900">
              {places.length > 0 ? `Found ${places.length} places` : 'Places Nearby'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Click to view on map and get directions</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {places.length === 0 && !loadingPlaces ? (
              <div className="text-center p-6 text-gray-400">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="text-sm">No places found in this area. Try searching a different category.</p>
              </div>
            ) : (
              places.map(place => (
                <div key={place.id}
                  onClick={() => handleListClick(place)}
                  className={`rounded-xl p-4 border cursor-pointer transition-all hover:shadow-md
                    ${selectedPlace?.id === place.id ? 'border-brand-500 bg-brand-50 shadow-md ring-1 ring-brand-500' : 'border-gray-100 bg-white'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{place.name}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {String(place.type).replace(/_/g,' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-brand-600 bg-brand-100 px-2 py-1 rounded-lg inline-block">
                        {place.distance} km
                      </span>
                    </div>
                  </div>
                  {selectedPlace?.id === place.id && routeCoordinates.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-brand-200">
                      <p className="text-xs font-semibold text-green-700 flex items-center gap-1">
                        🚗 Route calculated. Check the map!
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
