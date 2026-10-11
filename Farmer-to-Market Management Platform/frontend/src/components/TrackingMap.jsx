import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const CITY_COORDS = {
  nashik: [19.9975, 73.7898],
  hyderabad: [17.385, 78.4867],
  pune: [18.5204, 73.8567],
  mumbai: [19.076, 72.8777],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  delhi: [28.6139, 77.209],
  chennai: [13.0827, 80.2707],
}

const STATUS_PROGRESS = {
  PENDING: 0.05,
  CONFIRMED: 0.18,
  PROCESSING: 0.32,
  SHIPPED: 0.62,
  DELIVERED: 0.97,
  COMPLETED: 1,
  CANCELLED: 0,
}

function makeIcon(emoji, bg) {
  return L.divIcon({
    className: 'agri-marker',
    html: `<div style="background:${bg};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

const farmIcon = makeIcon('🧑‍🌾', '#2e7d32')
const destIcon = makeIcon('🏠', '#1565c0')
const truckIcon = makeIcon('🚚', '#9c27b0')

function resolvePoint(lat, lng, text) {
  if (lat != null && lng != null && !Number.isNaN(Number(lat))) {
    return [Number(lat), Number(lng)]
  }
  const hay = (text || '').toLowerCase()
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (hay.includes(city)) return coords
  }
  return [20.5937, 78.9629]
}

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(points, { padding: [48, 48], maxZoom: 8 })
    }
  }, [map, points])
  return null
}

const TrackingMap = ({ order, role }) => {
  const origin = useMemo(
    () => resolvePoint(
      order.originLat,
      order.originLng,
      `${order.originLabel || ''} ${order.items?.[0]?.crop?.farmer?.farmLocation || ''}`
    ),
    [order]
  )
  const dest = useMemo(
    () => resolvePoint(
      order.destLat,
      order.destLng,
      `${order.destLabel || ''} ${order.deliveryCity || ''} ${order.deliveryAddress || ''}`
    ),
    [order]
  )

  const baseProgress = STATUS_PROGRESS[order.status] ?? 0.1
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    if (order.status !== 'SHIPPED' && order.status !== 'CONFIRMED') return undefined
    const id = setInterval(() => setPulse((p) => (p + 0.004) % 0.12), 800)
    return () => clearInterval(id)
  }, [order.status])

  const progress = Math.min(1, baseProgress + (order.status === 'SHIPPED' ? pulse : 0))
  const truckPos = lerp(origin, dest, progress)
  const etaHours = Math.max(1, Math.round((1 - progress) * 18))

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #2e7d32' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        padding: '0.85rem 1rem',
        background: '#142016',
        color: '#c8e6c9',
        fontSize: '0.85rem',
      }}>
        <div>
          <strong style={{ color: '#fff' }}>{role === 'FARMER' ? 'Dispatch map' : 'Live goods tracking'}</strong>
          <div>Farm: {order.originLabel || origin.join(', ')}</div>
          <div>Delivery: {order.destLabel || `${order.deliveryAddress || ''}, ${order.deliveryCity || ''}`}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#81c784', fontWeight: 700 }}>{order.status}</div>
          <div>{progress >= 1 ? 'Arrived' : `ETA ~ ${etaHours} hrs`}</div>
          <div>{Math.round(progress * 100)}% of route complete</div>
        </div>
      </div>
      <MapContainer
        center={truckPos}
        zoom={6}
        style={{ height: '360px', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={[origin, dest]} />
        <Polyline positions={[origin, dest]} color="#81c784" weight={4} dashArray="8 8" />
        <Marker position={origin} icon={farmIcon}>
          <Popup>Farm pickup<br />{order.originLabel || 'Origin'}</Popup>
        </Marker>
        <Marker position={dest} icon={destIcon}>
          <Popup>Buyer delivery<br />{order.destLabel || order.deliveryCity || 'Destination'}</Popup>
        </Marker>
        {order.status !== 'CANCELLED' && (
          <Marker position={truckPos} icon={truckIcon}>
            <Popup>Goods in transit · {order.orderNumber}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

export default TrackingMap
