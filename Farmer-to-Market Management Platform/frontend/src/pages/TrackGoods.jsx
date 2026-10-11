import { useEffect, useState, useMemo } from 'react'
import { orderAPI } from '../services/api'
import TrackingMap from '../components/TrackingMap'
import { toast } from 'react-toastify'
import '../styles/Dashboard.css'

const STATUS_ICONS = {
  PENDING: '⏳',
  CONFIRMED: '✅',
  SHIPPED: '🚚',
  DELIVERED: '📦',
  COMPLETED: '🎉',
  CANCELLED: '❌',
}

const STATUS_COLORS = {
  PENDING: '#fbc02d',
  CONFIRMED: '#2196f3',
  SHIPPED: '#9c27b0',
  DELIVERED: '#4caf50',
  COMPLETED: '#2e7d32',
  CANCELLED: '#f44336',
}

const STATUS_PROGRESS = {
  PENDING: 5,
  CONFIRMED: 20,
  SHIPPED: 65,
  DELIVERED: 95,
  COMPLETED: 100,
  CANCELLED: 0,
}

const TrackGoods = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const role = localStorage.getItem('role')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = role === 'FARMER'
        ? await orderAPI.getMyFarmerOrders()
        : await orderAPI.getMyOrders()
      const data = res.data || []
      setOrders(data)
      // Auto-select the most active order
      const active = data.find((o) => ['SHIPPED', 'CONFIRMED'].includes(o.status))
        || data.find((o) => o.status === 'PENDING')
        || data[0]
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

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'ALL') return orders
    return orders.filter(o => o.status === filterStatus)
  }, [orders, filterStatus])

  const selected = orders.find((o) => o.id === selectedId)

  // Stats for header
  const activeShipments = orders.filter(o => ['SHIPPED', 'CONFIRMED'].includes(o.status)).length
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length
  const completedOrders = orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status)).length

  if (loading) {
    return (
      <div className="dashboard-container" style={{ padding: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>🗺️</div>
        <h2 style={{ color: 'var(--text-muted)' }}>Loading live tracking map…</h2>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>Fetching your shipment data</p>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    )
  }

  return (
    <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #182d1c 0%, #0f1c12 100%)',
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid rgba(46, 125, 50, 0.4)',
        marginBottom: '1.5rem',
        boxShadow: '0 6px 25px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 6px', color: '#fff', fontSize: '1.8rem' }}>
              {role === 'FARMER' ? '🗺️ Track Dispatches' : '🗺️ Track Your Goods'}
            </h1>
            <p style={{ margin: 0, color: '#c8e6c9', fontSize: '0.92rem' }}>
              {role === 'FARMER'
                ? 'Monitor every buyer delivery from your farm — follow trucks live on the map.'
                : 'Follow your farm-fresh orders from pickup at the farm to your delivery address in real-time.'}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            style={{
              background: '#2e7d32',
              color: 'white',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            🔄 Refresh Map
          </button>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: 'In Transit', value: activeShipments, icon: '🚚', color: '#9c27b0' },
            { label: 'Pending', value: pendingOrders, icon: '⏳', color: '#fbc02d' },
            { label: 'Completed', value: completedOrders, icon: '✅', color: '#4caf50' },
            { label: 'Total', value: orders.length, icon: '📋', color: '#2196f3' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              padding: '0.6rem 1rem',
              border: `1px solid ${stat.color}30`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: '1',
              minWidth: '110px',
            }}>
              <span style={{ fontSize: '1.2rem' }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.7rem', color: stat.color }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          padding: '3rem 2rem',
          borderRadius: '16px',
          border: '1px dashed #444',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No Shipments to Track</h3>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            {role === 'BUYER'
              ? 'Place an order and the live tracking map will appear here automatically.'
              : 'Once buyers place orders for your crops, you can track dispatches here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.25rem', alignItems: 'start' }}>

          {/* Left: Order selector sidebar */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
          }}>
            {/* Filter bar */}
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #333', background: '#1a1a1a' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                Filter by Status
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setFilterStatus(s)
                      // Auto-select first matching
                      const match = orders.find(o => s === 'ALL' ? true : o.status === s)
                      if (match) setSelectedId(match.id)
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      border: `1px solid ${filterStatus === s ? (STATUS_COLORS[s] || '#2e7d32') : '#333'}`,
                      background: filterStatus === s ? `${STATUS_COLORS[s] || '#2e7d32'}20` : 'transparent',
                      color: filterStatus === s ? (STATUS_COLORS[s] || '#81c784') : '#888',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: filterStatus === s ? 700 : 400,
                    }}
                  >
                    {s === 'ALL' ? 'All' : `${STATUS_ICONS[s]} ${s}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Order list */}
            <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
              {filteredOrders.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
                  No {filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''} orders found
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedId === order.id
                  const sc = STATUS_COLORS[order.status] || '#888'
                  const progress = STATUS_PROGRESS[order.status] || 0

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedId(order.id)}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #2a2a2a',
                        cursor: 'pointer',
                        background: isSelected ? `${sc}12` : 'transparent',
                        borderLeft: isSelected ? `3px solid ${sc}` : '3px solid transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div style={{ fontWeight: 700, color: isSelected ? '#fff' : '#ccc', fontSize: '0.88rem' }}>
                          {order.orderNumber}
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '10px',
                          background: `${sc}20`,
                          color: sc,
                          border: `1px solid ${sc}40`,
                        }}>
                          {STATUS_ICONS[order.status]} {order.status}
                        </span>
                      </div>

                      {/* Items summary */}
                      <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '6px' }}>
                        {(order.items || []).slice(0, 2).map(i => i.crop?.name).filter(Boolean).join(' · ')}
                        {(order.items || []).length > 2 && '...'}
                      </div>

                      {/* Progress mini bar */}
                      <div style={{ height: '3px', background: '#2a2a2a', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${progress}%`,
                          height: '100%',
                          background: sc,
                          borderRadius: '3px',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.72rem', color: '#666' }}>
                        <span>₹{(order.totalAmount || 0).toFixed(0)}</span>
                        <span>{progress}% done</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right: Map display */}
          <div>
            {selected ? (
              <TrackingMap order={selected} role={role} />
            ) : (
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px dashed #444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                <h3 style={{ color: 'var(--text-muted)' }}>Select an order to view its map</h3>
                <p style={{ color: '#666', fontSize: '0.85rem' }}>Click any order from the list on the left</p>
              </div>
            )}

            {/* Order details card below map */}
            {selected && (
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                padding: '1.25rem',
                marginTop: '1rem',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '4px', fontWeight: 600 }}>ORDER NUMBER</div>
                    <div style={{ fontWeight: 700, color: 'white' }}>{selected.orderNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '4px', fontWeight: 600 }}>TOTAL AMOUNT</div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>₹{(selected.totalAmount || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '4px', fontWeight: 600 }}>DELIVERY ADDRESS</div>
                    <div style={{ color: '#ccc', fontSize: '0.88rem' }}>
                      {selected.deliveryAddress}{selected.deliveryCity && `, ${selected.deliveryCity}`}
                      {selected.deliveryPincode && ` - ${selected.deliveryPincode}`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '4px', fontWeight: 600 }}>ITEMS</div>
                    <div style={{ color: '#ccc', fontSize: '0.88rem' }}>
                      {(selected.items || []).map(i => i.crop?.name).filter(Boolean).join(', ') || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive layout fix for mobile */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="300px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default TrackGoods
