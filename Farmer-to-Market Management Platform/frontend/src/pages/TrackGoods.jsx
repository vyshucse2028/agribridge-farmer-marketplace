import { useEffect, useState } from 'react'
import { orderAPI } from '../services/api'
import TrackingMap from '../components/TrackingMap'
import { toast } from 'react-toastify'
import '../styles/Dashboard.css'

const TrackGoods = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const role = localStorage.getItem('role')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = role === 'FARMER'
        ? await orderAPI.getMyFarmerOrders()
        : await orderAPI.getMyOrders()
      const data = res.data || []
      setOrders(data)
      const active = data.find((o) => ['CONFIRMED', 'SHIPPED', 'PENDING'].includes(o.status)) || data[0]
      setSelectedId((prev) => prev || active?.id || null)
    } catch {
      toast.error('Could not load shipments for the map')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const selected = orders.find((o) => o.id === selectedId)

  if (loading) {
    return (
      <div className="dashboard-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Loading live map…</h2>
      </div>
    )
  }

  return (
    <div className="dashboard-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #182d1c 0%, #0f1c12 100%)',
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid rgba(46, 125, 50, 0.4)',
        marginBottom: '1.5rem',
      }}>
        <h1 style={{ margin: '0 0 6px', color: '#fff' }}>
          {role === 'FARMER' ? '🗺️ Track dispatches' : '🗺️ Track your goods'}
        </h1>
        <p style={{ margin: 0, color: '#c8e6c9' }}>
          {role === 'FARMER'
            ? 'See every buyer delivery from your farm on the map and follow trucks in transit.'
            : 'Follow farm-fresh orders from pickup at the farm to your delivery address.'}
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '12px', textAlign: 'center' }}>
          No shipments to track yet. Place or receive an order and the live map will appear here.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedId(order.id)}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: selectedId === order.id ? '1px solid #4caf50' : '1px solid #444',
                  background: selectedId === order.id ? 'rgba(76,175,80,0.2)' : '#222',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                {order.orderNumber} · {order.status}
              </button>
            ))}
            <button
              type="button"
              onClick={fetchOrders}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: '#2e7d32',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              🔄 Refresh
            </button>
          </div>
          {selected && <TrackingMap order={selected} role={role} />}
        </>
      )}
    </div>
  )
}

export default TrackGoods
