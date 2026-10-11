import { useState, useEffect } from 'react'
import { orderAPI } from '../services/api'
import { toast } from 'react-toastify'
import TrackingMap from '../components/TrackingMap'
import '../styles/Dashboard.css'

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED']

const STATUS_COLORS = {
  PENDING: { bg: 'rgba(251, 192, 45, 0.15)', color: '#fbc02d', border: '#fbc02d' },
  CONFIRMED: { bg: 'rgba(33, 150, 243, 0.15)', color: '#2196f3', border: '#2196f3' },
  SHIPPED: { bg: 'rgba(156, 39, 176, 0.15)', color: '#ce93d8', border: '#9c27b0' },
  DELIVERED: { bg: 'rgba(76, 175, 80, 0.15)', color: '#81c784', border: '#4caf50' },
  COMPLETED: { bg: 'rgba(56, 142, 60, 0.2)', color: '#4caf50', border: '#2e7d32' },
  CANCELLED: { bg: 'rgba(211, 47, 47, 0.15)', color: '#f44336', border: '#d32f2f' },
}

const STATUS_ICONS = {
  PENDING: '⏳',
  CONFIRMED: '✅',
  SHIPPED: '🚚',
  DELIVERED: '📦',
  COMPLETED: '🎉',
  CANCELLED: '❌',
}

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [showMap, setShowMap] = useState(null) // orderId of map being shown

  const role = localStorage.getItem('role')
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let res
      if (role === 'FARMER') {
        res = await orderAPI.getMyFarmerOrders()
      } else {
        res = await orderAPI.getMyOrders()
      }
      setOrders(res.data)
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus)
      toast.success(`Order status updated to ${newStatus} ${STATUS_ICONS[newStatus] || ''}`)
      fetchOrders()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getStatusStep = (status) => STATUS_FLOW.indexOf(status)

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filterStatus === 'ALL' || order.status === filterStatus
    const matchesSearch = !searchTerm ||
      (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.items || []).some(item => (item.crop?.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  // Stats
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length
  const activeOrders = orders.filter(o => ['CONFIRMED', 'SHIPPED'].includes(o.status)).length
  const completedOrders = orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status)).length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>📦</div>
        <h2 style={{ color: 'var(--text-muted)' }}>Loading orders...</h2>
      </div>
    )
  }

  return (
    <div className="dashboard-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #182d1c 0%, #0f1c12 100%)',
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid rgba(46, 125, 50, 0.4)',
        marginBottom: '2rem',
        boxShadow: '0 6px 25px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', margin: '0 0 4px 0', color: 'white' }}>
              {role === 'FARMER' ? '🧑‍🌾 Order Management' : '📦 My Orders'}
            </h1>
            <p style={{ color: '#c8e6c9', margin: 0, fontSize: '0.92rem' }}>
              {role === 'FARMER'
                ? 'Manage buyer orders, track dispatches, and update delivery status.'
                : 'Track your farm-fresh orders from placement to doorstep delivery.'}
            </p>
          </div>
          <button
            onClick={() => fetchOrders()}
            style={{
              background: '#2e7d32',
              color: 'white',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem'
            }}
            id="refresh-orders-btn"
          >
            🔄 Refresh Orders
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Total Orders', value: totalOrders, icon: '📋', color: '#2196f3' },
          { label: 'Pending', value: pendingOrders, icon: '⏳', color: '#fbc02d' },
          { label: 'Active / In Transit', value: activeOrders, icon: '🚚', color: '#9c27b0' },
          { label: 'Completed', value: completedOrders, icon: '✅', color: '#4caf50' },
          { label: role === 'FARMER' ? 'Total Revenue' : 'Total Spent', value: `₹${totalRevenue.toFixed(0)}`, icon: '💰', color: '#ff9800' },
        ].map((stat, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-card)',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div style={{
              fontSize: '1.8rem',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${stat.color}15`,
              borderRadius: '12px',
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', fontFamily: "'Outfit', sans-serif" }}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['ALL', ...STATUS_FLOW, 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                border: `1px solid ${filterStatus === status ? (STATUS_COLORS[status]?.border || 'var(--primary)') : 'var(--border-color)'}`,
                background: filterStatus === status ? (STATUS_COLORS[status]?.bg || 'rgba(46,125,50,0.15)') : 'transparent',
                color: filterStatus === status ? (STATUS_COLORS[status]?.color || 'var(--primary)') : 'var(--text-muted)',
                fontWeight: filterStatus === status ? 600 : 400,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {status === 'ALL' ? '📋 All' : `${STATUS_ICONS[status] || ''} ${status}`}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by order # or crop name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: '#2a2a2a',
            color: 'white',
            fontSize: '0.88rem',
            minWidth: '240px',
          }}
          id="order-search-input"
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px dashed #444',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ color: 'var(--text-muted)' }}>
            {filterStatus !== 'ALL' ? `No ${filterStatus.toLowerCase()} orders found.` : 'No orders found.'}
          </h3>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            {role === 'BUYER' ? 'Browse crops and place your first order!' : 'Orders from buyers will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOrders.map(order => {
            const isExpanded = expandedOrder === order.id
            const statusStep = getStatusStep(order.status)
            const isMapOpen = showMap === order.id
            const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING

            return (
              <div
                key={order.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '14px',
                  border: `1px solid ${isExpanded ? statusStyle.border : 'var(--border-color)'}`,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: isExpanded ? `0 4px 20px ${statusStyle.bg}` : 'none',
                }}
              >
                {/* Order Header Row - Always visible */}
                <div
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  style={{
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: role === 'FARMER' ? '1fr 1fr 1fr 1fr auto auto' : '1fr 1fr 1fr 1fr auto',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'background 0.2s',
                  }}
                  id={`order-row-${order.id}`}
                >
                  {/* Order Number */}
                  <div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                      {order.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '2px' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div>
                    <div style={{ fontSize: '0.88rem', color: '#ccc' }}>
                      {(order.items || []).length} {(order.items || []).length === 1 ? 'item' : 'items'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '2px' }}>
                      {(order.items || []).slice(0, 2).map(i => i.crop?.name).join(', ')}
                      {(order.items || []).length > 2 && '...'}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '1.05rem' }}>
                      ₹{(order.totalAmount || 0).toFixed(2)}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0.3rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}40`,
                    }}>
                      {STATUS_ICONS[order.status]} {order.status}
                    </span>
                  </div>

                  {/* Quick Action for Farmer */}
                  {role === 'FARMER' && (
                    <div onClick={(e) => e.stopPropagation()}>
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#2196f3',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          ✅ Confirm
                        </button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#9c27b0',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          🚚 Ship
                        </button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#4caf50',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          📦 Delivered
                        </button>
                      )}
                      {order.status === 'DELIVERED' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#2e7d32',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          🎉 Complete
                        </button>
                      )}
                    </div>
                  )}

                  {/* Expand Icon */}
                  <div style={{
                    fontSize: '1.2rem',
                    color: '#888',
                    transition: 'transform 0.3s',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>
                    ▼
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    padding: '0 1.5rem 1.5rem 1.5rem',
                    borderTop: '1px solid #333',
                    animation: 'fadeIn 0.3s ease',
                  }}>
                    {/* Visual Progress Timeline */}
                    {order.status !== 'CANCELLED' && (
                      <div style={{ margin: '1.5rem 0', padding: '1rem', background: '#1a1a1a', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ccc', marginBottom: '1rem' }}>
                          📍 Order Tracking Progress
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                          {/* Progress Line */}
                          <div style={{
                            position: 'absolute',
                            top: '18px',
                            left: '24px',
                            right: '24px',
                            height: '3px',
                            background: '#333',
                            zIndex: 0,
                          }}>
                            <div style={{
                              width: `${Math.max(0, (statusStep / (STATUS_FLOW.length - 1)) * 100)}%`,
                              height: '100%',
                              background: `linear-gradient(90deg, ${statusStyle.color}, ${statusStyle.border})`,
                              borderRadius: '4px',
                              transition: 'width 0.5s ease',
                            }} />
                          </div>

                          {STATUS_FLOW.map((step, idx) => {
                            const isActive = idx <= statusStep
                            const isCurrent = idx === statusStep
                            return (
                              <div key={step} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                zIndex: 1,
                                flex: 1,
                              }}>
                                <div style={{
                                  width: isCurrent ? '38px' : '32px',
                                  height: isCurrent ? '38px' : '32px',
                                  borderRadius: '50%',
                                  background: isActive
                                    ? (isCurrent ? statusStyle.color : '#4caf50')
                                    : '#333',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: isCurrent ? '1rem' : '0.85rem',
                                  boxShadow: isCurrent ? `0 0 15px ${statusStyle.color}60` : 'none',
                                  transition: 'all 0.3s ease',
                                  border: isCurrent ? `2px solid ${statusStyle.color}` : 'none',
                                }}>
                                  {isActive ? STATUS_ICONS[step] : '○'}
                                </div>
                                <div style={{
                                  marginTop: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: isCurrent ? 700 : 400,
                                  color: isActive ? (isCurrent ? statusStyle.color : '#81c784') : '#666',
                                  textAlign: 'center',
                                }}>
                                  {step}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Order Items Table */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ccc', marginBottom: '0.6rem' }}>
                        🧺 Order Items
                      </div>
                      <div style={{ background: '#1a1a1a', borderRadius: '10px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#222' }}>
                              <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontSize: '0.78rem', color: '#888', fontWeight: 600 }}>CROP</th>
                              <th style={{ padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.78rem', color: '#888', fontWeight: 600 }}>QTY</th>
                              <th style={{ padding: '0.6rem 1rem', textAlign: 'right', fontSize: '0.78rem', color: '#888', fontWeight: 600 }}>RATE</th>
                              <th style={{ padding: '0.6rem 1rem', textAlign: 'right', fontSize: '0.78rem', color: '#888', fontWeight: 600 }}>SUBTOTAL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(order.items || []).map((item, idx) => (
                              <tr key={item.id || idx} style={{ borderBottom: '1px solid #2a2a2a' }}>
                                <td style={{ padding: '0.6rem 1rem', fontSize: '0.88rem' }}>
                                  <span style={{ marginRight: '6px' }}>🌿</span>
                                  {item.crop?.name || 'Crop'}
                                </td>
                                <td style={{ padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.88rem', color: '#ccc' }}>
                                  {item.quantity} {item.crop?.unit || 'units'}
                                </td>
                                <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontSize: '0.88rem', color: '#ccc' }}>
                                  ₹{(item.unitPrice || item.crop?.pricePerUnit || 0).toFixed(2)}
                                </td>
                                <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontSize: '0.88rem', fontWeight: 600 }}>
                                  ₹{(item.subtotal || (item.quantity * (item.unitPrice || 0))).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{ background: '#1f1f1f' }}>
                              <td colSpan="3" style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.9rem', color: '#ccc' }}>
                                Total:
                              </td>
                              <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: 700, fontSize: '1.05rem', color: 'white' }}>
                                ₹{(order.totalAmount || 0).toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* Delivery Info + Map Toggle */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      {/* Delivery Address */}
                      <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '10px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                          📍 Delivery Address
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#ddd', lineHeight: '1.5' }}>
                          {order.deliveryAddress || 'N/A'}
                          {order.deliveryCity && <>, {order.deliveryCity}</>}
                          {order.deliveryPincode && <> - {order.deliveryPincode}</>}
                        </div>
                      </div>

                      {/* Order Info */}
                      <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '10px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                          📋 Order Info
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div>
                            <span style={{ color: '#888' }}>Placed:</span>{' '}
                            {new Date(order.createdAt).toLocaleString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit', hour12: true
                            })}
                          </div>
                          {order.updatedAt && (
                            <div>
                              <span style={{ color: '#888' }}>Updated:</span>{' '}
                              {new Date(order.updatedAt).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', hour12: true
                              })}
                            </div>
                          )}
                          {order.notes && (
                            <div style={{ marginTop: '4px' }}>
                              <span style={{ color: '#888' }}>Notes:</span>{' '}
                              <span style={{ color: '#ffb703' }}>{order.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Map Tracking Button */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setShowMap(isMapOpen ? null : order.id)}
                        style={{
                          padding: '0.6rem 1.2rem',
                          borderRadius: '10px',
                          border: `1px solid ${isMapOpen ? '#4caf50' : '#444'}`,
                          background: isMapOpen ? 'rgba(76, 175, 80, 0.15)' : '#222',
                          color: isMapOpen ? '#81c784' : '#ccc',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                        }}
                        id={`track-map-btn-${order.id}`}
                      >
                        🗺️ {isMapOpen ? 'Hide Map Tracking' : 'Open Live Map Tracking'}
                      </button>

                      {/* Farmer Action Buttons */}
                      {role === 'FARMER' && (
                        <>
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                              style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '10px',
                                border: 'none',
                                background: '#2196f3',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              ✅ Confirm Order
                            </button>
                          )}
                          {order.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                              style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '10px',
                                border: 'none',
                                background: '#9c27b0',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              🚚 Mark as Shipped
                            </button>
                          )}
                          {order.status === 'SHIPPED' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                              style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '10px',
                                border: 'none',
                                background: '#4caf50',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              📦 Mark as Delivered
                            </button>
                          )}
                          {order.status === 'DELIVERED' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                              style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '10px',
                                border: 'none',
                                background: '#2e7d32',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              🎉 Mark as Completed
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Map Component */}
                    {isMapOpen && (
                      <div style={{ marginTop: '1rem' }}>
                        <TrackingMap
                          order={order}
                          role={role}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default Orders
