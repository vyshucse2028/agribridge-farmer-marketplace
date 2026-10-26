import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const CITY_COORDS = {
  nashik: [19.9975, 73.7898],
  lasalgaon: [20.1472, 74.2273],
  hyderabad: [17.385, 78.4867],
  pune: [18.5204, 73.8567],
  mumbai: [19.076, 72.8777],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  kolar: [13.1367, 78.1291],
  delhi: [28.6139, 77.209],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  punjab: [30.9010, 75.8573],
  haryana: [29.0588, 76.0856],
  chandigarh: [30.7333, 76.7794],
  nagpur: [21.1458, 79.0882],
  surat: [21.1702, 72.8311],
  indore: [22.7196, 75.8577],
  bhopal: [23.2599, 77.4126],
  kochi: [9.9312, 76.2673],
  kerala: [10.8505, 76.2711],
  andhra: [16.5062, 80.6480],
  guntur: [16.3067, 80.4365],
  kurnool: [15.8281, 78.0373],
  dehradun: [30.3165, 78.0322],
  agra: [27.1767, 78.0081],
}

const STATUS_PROGRESS = {
  PENDING: 0.08,
  CONFIRMED: 0.25,
  PROCESSING: 0.40,
  SHIPPED: 0.68,
  DELIVERED: 0.98,
  COMPLETED: 1,
  CANCELLED: 0,
}

// ── Fix: Leaflet broken default-icon bug in React/Vite ──
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function makeIcon(emoji, bg) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${bg};width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;border:3px solid rgba(255,255,255,0.9);box-shadow:0 4px 14px rgba(0,0,0,.6)">${emoji}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -24],
  })
}

const farmIcon = makeIcon('🧑‍🌾', '#2e7d32')
const destIcon = makeIcon('🏠', '#1565c0')
const truckIcon = makeIcon('🚚', '#9c27b0')

function resolvePoint(lat, lng, text, fallback = [20.5937, 78.9629]) {
  if (lat != null && lng != null && !Number.isNaN(Number(lat)) && Number(lat) !== 0) {
    return [Number(lat), Number(lng)]
  }
  const hay = (text || '').toLowerCase()
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (hay.includes(city)) return coords
  }
  return fallback
}

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

function haversineKm(a, b) {
  const R = 6371
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLon = ((b[1] - a[1]) * Math.PI) / 180
  const lat1 = (a[0] * Math.PI) / 180
  const lat2 = (b[0] * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length >= 2) {
      try {
        map.fitBounds(points, { padding: [60, 60], maxZoom: 10 })
      } catch (_) { /* ignore */ }
    }
  }, [map, points])
  return null
}

const STATUS_COLORS = {
  PENDING: '#fbc02d',
  CONFIRMED: '#2196f3',
  PROCESSING: '#00bcd4',
  SHIPPED: '#9c27b0',
  DELIVERED: '#4caf50',
  COMPLETED: '#2e7d32',
  CANCELLED: '#f44336',
}

const STATUS_ICONS = {
  PENDING: '⏳',
  CONFIRMED: '✅',
  PROCESSING: '🔄',
  SHIPPED: '🚚',
  DELIVERED: '📦',
  COMPLETED: '🎉',
  CANCELLED: '❌',
}

const TrackingMap = ({ order, role }) => {
  const firstCropFarmer = order.items?.[0]?.crop?.farmer
  const farmLocationText = `${order.originLabel || ''} ${firstCropFarmer?.farmName || ''} ${firstCropFarmer?.farmLocation || ''}`
  const destLocationText = `${order.destLabel || ''} ${order.deliveryCity || ''} ${order.deliveryAddress || ''} ${order.buyer?.city || ''}`

  const rawOrigin = useMemo(
    () => resolvePoint(
      order.originLat || firstCropFarmer?.latitude,
      order.originLng || firstCropFarmer?.longitude,
      farmLocationText,
      [19.9975, 73.7898] // Default to Nashik farm hub
    ),
    [order, firstCropFarmer, farmLocationText]
  )

  const rawDest = useMemo(
    () => resolvePoint(
      order.destLat || order.buyer?.latitude,
      order.destLng || order.buyer?.longitude,
      destLocationText,
      [18.5204, 73.8567] // Default to Pune market hub
    ),
    [order, destLocationText]
  )

  // Ensure origin and destination are distinct points so the route is always clearly visual
  const [origin, dest] = useMemo(() => {
    const dist = haversineKm(rawOrigin, rawDest)
    if (dist < 10) {
      // Offset destination slightly to represent local doorstep delivery route (~15km)
      return [rawOrigin, [rawOrigin[0] + 0.12, rawOrigin[1] + 0.15]]
    }
    return [rawOrigin, rawDest]
  }, [rawOrigin, rawDest])

  const baseProgress = STATUS_PROGRESS[order.status] ?? 0.1
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    if (order.status !== 'SHIPPED' && order.status !== 'CONFIRMED') return undefined
    const id = setInterval(() => setPulse((p) => (p + 0.005) % 0.12), 800)
    return () => clearInterval(id)
  }, [order.status])

  const progress = Math.min(1, baseProgress + (order.status === 'SHIPPED' ? pulse : 0))
  const truckPos = lerp(origin, dest, progress)
  const distanceKm = Math.round(haversineKm(origin, dest))
  const etaHours = Math.max(1, Math.round((1 - progress) * Math.max(4, distanceKm / 60)))
  const statusColor = STATUS_COLORS[order.status] || '#81c784'
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', border: `1px solid ${statusColor}40`, boxShadow: `0 4px 20px ${statusColor}20` }}>
      {/* Header Info Panel */}
      <div style={{
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, #142016 0%, #0d1a0f 100%)',
        borderBottom: `2px solid ${statusColor}30`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🗺️</span>
              {role === 'FARMER' ? 'Dispatch Tracking Map' : 'Live Goods Tracking'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🧑‍🌾</span>
                <span style={{ color: '#888' }}>Farm:</span>
                <span style={{ color: '#81c784', fontWeight: 500 }}>
                  {order.originLabel || (firstCropFarmer?.farmName ? `${firstCropFarmer.farmName} (${firstCropFarmer.farmLocation || 'Farm'})` : 'Local Farm Origin')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏠</span>
                <span style={{ color: '#888' }}>Delivery:</span>
                <span style={{ color: '#90caf9', fontWeight: 500 }}>
                  {order.destLabel || [order.deliveryAddress, order.deliveryCity || order.buyer?.city, order.deliveryPincode].filter(Boolean).join(', ') || 'Buyer Destination'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0.3rem 0.8rem',
              borderRadius: '20px',
              background: `${statusColor}20`,
              border: `1px solid ${statusColor}40`,
              color: statusColor,
              fontWeight: 700,
              fontSize: '0.82rem',
              marginBottom: '0.4rem'
            }}>
              {STATUS_ICONS[order.status]} {order.status}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#aaa' }}>
              {progress >= 1 ? (
                <span style={{ color: '#4caf50', fontWeight: 600 }}>✅ Arrived at Destination</span>
              ) : isCancelled ? (
                <span style={{ color: '#f44336' }}>Order Cancelled</span>
              ) : (
                <>
                  <div>📍 {Math.round(progress * 100)}% complete</div>
                  <div>🚗 ~{distanceKm} km · ETA ~{etaHours} hrs</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {!isCancelled && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ height: '4px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.round(progress * 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${statusColor}, ${statusColor}80)`,
                borderRadius: '4px',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={truckPos}
        zoom={6}
        style={{ height: '380px', width: '100%' }}
        scrollWheelZoom
        key={`map-${order.id}-${order.status}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={[origin, dest]} />

        {/* Full route dashed line */}
        <Polyline
          positions={[origin, dest]}
          color={statusColor}
          weight={2}
          dashArray="6 8"
          opacity={0.4}
        />
        {/* Completed portion */}
        {!isCancelled && progress > 0.02 && (
          <Polyline
            positions={[origin, truckPos]}
            color={statusColor}
            weight={4}
            opacity={0.85}
          />
        )}

        <Marker position={origin} icon={farmIcon}>
          <Popup>
            <strong>🧑‍🌾 Farm Pickup</strong><br />
            {order.originLabel || 'Origin Farm'}
          </Popup>
        </Marker>

        <Marker position={dest} icon={destIcon}>
          <Popup>
            <strong>🏠 Buyer Delivery</strong><br />
            {order.destLabel || order.deliveryCity || 'Destination'}
          </Popup>
        </Marker>

        {!isCancelled && (
          <Marker position={truckPos} icon={truckIcon}>
            <Popup>
              <strong>🚚 Goods in Transit</strong><br />
              Order: {order.orderNumber}<br />
              Status: {order.status}<br />
              Progress: {Math.round(progress * 100)}%
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Footer legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '0.5rem 1rem',
        background: '#0d1a0f',
        fontSize: '0.75rem',
        color: '#666',
        flexWrap: 'wrap'
      }}>
        <span>🧑‍🌾 Farm Origin</span>
        <span>🚚 Current Location</span>
        <span>🏠 Delivery Point</span>
        <span>© OpenStreetMap</span>
      </div>
    </div>
  )
}

export default TrackingMap
