import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { orderAPI, cropAPI } from '../services/api'
import CropCard from '../components/CropCard'
import { toast } from 'react-toastify'
import '../styles/Dashboard.css'

const MARKET_NEWS = [
  {
    id: 1,
    tag: 'Fresh Harvest',
    title: 'Winter Vegetables Arriving at Mandis',
    summary: 'Direct farm arrivals of tomatoes, carrots, and leafy spinach increased by 20% this week.',
    icon: '🥦'
  },
  {
    id: 2,
    tag: 'Fair Pricing',
    title: 'Zero Brokerage Farm Direct Savings',
    summary: 'Buyers on AgriBridge save an estimated 25-35% compared to conventional retail intermediaries.',
    icon: '💰'
  },
  {
    id: 3,
    tag: 'Quality Standard',
    title: 'Farm Quality Verification Program',
    summary: 'New quality guidelines implemented for organic grains and natural pulse varieties.',
    icon: '⭐'
  }
]

const BuyerDashboard = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [recommendedCrops, setRecommendedCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const firstName = localStorage.getItem('firstName')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true)
      const [ordersRes, cropsRes] = await Promise.all([
        orderAPI.getMyOrders(),
        cropAPI.getAll()
      ])
      setOrders(ordersRes.data)
      setRecommendedCrops(cropsRes.data.slice(0, 4))
      if (showToast) {
        toast.success('Dashboard updated successfully! 🔄')
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleAddToCart = (crop) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = currentCart.find(item => item.id === crop.id)
    
    if (existingItem) {
      existingItem.cartQuantity += 1
    } else {
      currentCart.push({ ...crop, cartQuantity: 1 })
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart))
    toast.success(`${crop.name} added to cart! 🛒`)
  }

  if (loading) return <div className="loader">Loading dashboard...</div>

  const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED', 'DELIVERED'].includes(o.status)).length

  return (
    <div className="dashboard-container">
      {/* Header with Action Buttons */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Welcome back, {firstName} 🛒</h1>
          <p>Find the best fresh produce directly from farmers with transparent pricing.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={() => fetchDashboardData(true)} 
            disabled={refreshing}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              cursor: refreshing ? 'not-allowed' : 'pointer',
              background: '#2e7d32',
              color: 'white',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
            id="buyer-refresh-dashboard-btn"
          >
            <span>🔄</span> {refreshing ? 'Updating...' : 'Update Dashboard'}
          </button>
          <Link to="/buyer/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }} id="buyer-edit-profile-btn">
            <span>✏️</span> Edit Profile
          </Link>
          <Link to="/crops" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: 'white', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
            <span>🍎</span> Browse Crops
          </Link>
          <Link to="/buyer/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1565c0', color: 'white', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
            <span>📦</span> Bulk Order / Cart
          </Link>
          <Link to="/buyer/track" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#6a1b9a', color: 'white', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
            <span>🗺️</span> Track Goods
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p className="stat-value">{orders.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-info">
            <h3>Active Deliveries</h3>
            <p className="stat-value">{activeOrders}</p>
          </div>
        </div>
        <Link to="/buyer/track" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ border: '1px solid #9c27b0', background: 'rgba(156, 39, 176, 0.1)', cursor: 'pointer', height: '100%' }}>
            <div className="stat-icon">🗺️</div>
            <div className="stat-info">
              <h3 style={{ color: '#ce93d8' }}>Live Goods Map</h3>
              <p className="stat-value" style={{ fontSize: '1rem', color: '#81c784', marginTop: '4px' }}>Track Dispatches →</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Agriculture & Market News */}
      <div className="dashboard-section" style={{ background: '#1c241d', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(46, 125, 50, 0.3)', marginBottom: '2rem' }}>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📰</span> Farmer Updates & Market News
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>FRESH DISPATCHES</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {MARKET_NEWS.map((news) => (
            <div 
              key={news.id} 
              style={{
                background: '#242e25',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #2d3b2e',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', background: 'rgba(46, 125, 50, 0.3)', color: '#4caf50', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  {news.tag}
                </span>
              </div>
              <h4 style={{ margin: '0.3rem 0', fontSize: '0.95rem', color: '#fff' }}>
                {news.icon} {news.title}
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#bbb', margin: 0 }}>
                {news.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works for Buyers */}
      <div className="dashboard-section" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🛒</span> How Buying on AgriBridge Works
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { step: '1', title: 'Browse Harvest', desc: 'Explore categories of fresh vegetables, fruits, and grains directly from farmers.' },
            { step: '2', title: 'Add to Cart', desc: 'Select desired quantity in kg, quintal, or dozens at fair farmer prices.' },
            { step: '3', title: 'Farmer Dispatches', desc: 'The farmer confirms and prepares freshly harvested produce for shipment.' },
            { step: '4', title: 'Direct Delivery', desc: 'Receive produce farm-fresh directly at your doorstep without middleman delays.' }
          ].map(s => (
            <div key={s.step} style={{ background: '#252525', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                Step {s.step}
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>{s.title}</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <Link to="/buyer/orders" className="btn-text">View All</Link>
        </div>
        
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>You haven't placed any orders yet.</p>
            <Link to="/crops" className="btn-primary">Browse Crops</Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Live Map Option</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'white' }}>₹{order.totalAmount.toFixed(2)}</td>
                    <td>
                      <Link 
                        to="/buyer/track" 
                        style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'rgba(156, 39, 176, 0.2)',
                          border: '1px solid #9c27b0',
                          color: '#e1bee7',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          textDecoration: 'none'
                        }}
                      >
                        🗺️ Track on Map
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recommended Crops */}
      <div className="dashboard-section mt-4">
        <div className="section-header">
          <h2>Recommended Fresh Crops</h2>
          <Link to="/crops" className="btn-text">See all</Link>
        </div>
        
        <div className="crops-grid">
          {recommendedCrops.map(crop => (
            <CropCard 
              key={crop.id} 
              crop={crop} 
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default BuyerDashboard
