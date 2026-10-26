import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { orderAPI, cropAPI } from '../services/api'
import CropCard from '../components/CropCard'
import PersonalDashboardCard from '../components/PersonalDashboardCard'
import LiveNewsTicker from '../components/LiveNewsTicker'
import { toast } from 'react-toastify'
import { useAppThemeLanguage } from '../context/ThemeLanguageContext'
import '../styles/Dashboard.css'

const MARKET_INSIGHTS = [
  {
    id: 1,
    tag: 'Fresh Harvest',
    title: 'New Season Produce Arriving at Mandis',
    summary: 'Direct farm arrivals of tomatoes, pulses, and leafy greens increased across regional APMCs.',
    icon: '🥦'
  },
  {
    id: 2,
    tag: 'Zero Commission',
    title: 'Zero Brokerage Direct Farmer Sourcing',
    summary: 'Buyers on AgriBridge save an estimated 25-35% compared to conventional wholesale market intermediaries.',
    icon: '💰'
  },
  {
    id: 3,
    tag: 'Verified Quality',
    title: 'Direct Farm Quality Verification Program',
    summary: 'Standardized quality checks and moisture parameters verified for grains and pulse varieties.',
    icon: '⭐'
  }
]

const BuyerDashboard = () => {
  const navigate = useNavigate()
  const { t } = useAppThemeLanguage()
  const [orders, setOrders] = useState([])
  const [recommendedCrops, setRecommendedCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const firstName = localStorage.getItem('firstName') || 'Buyer'

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

  if (loading) return <div className="loader" style={{ textAlign: 'center', padding: '3rem' }}>Loading Buyer Portal...</div>

  const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED', 'DELIVERED'].includes(o.status)).length
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  return (
    <div className="dashboard-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header Banner (NO yellow highlights) */}
      <div className="dashboard-header" style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(15, 23, 42, 0.4) 100%)',
        padding: '1.5rem 1.75rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: '#3b82f6', 
              boxShadow: '0 0 10px #3b82f6'
            }} />
            <span style={{ fontSize: '0.82rem', color: '#93c5fd', fontWeight: 700, letterSpacing: '0.5px' }}>
              COMMERCIAL PRODUCE PROCUREMENT PORTAL
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            Welcome back, {firstName} 🛒
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.92rem' }}>
            Direct sourcing from verified Indian farmers with transparent APMC benchmark pricing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={() => fetchDashboardData(true)} 
            disabled={refreshing}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              cursor: refreshing ? 'not-allowed' : 'pointer',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              fontWeight: 650,
              fontSize: '0.88rem'
            }}
            id="buyer-refresh-dashboard-btn"
          >
            <span>🔄</span> {refreshing ? 'Updating...' : 'Update Dashboard'}
          </button>
          <Link to="/crops" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1d4ed8', color: 'white', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 650, fontSize: '0.88rem', textDecoration: 'none' }}>
            <span>🌾</span> Browse Crops
          </Link>
          <Link to="/buyer/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#15803d', color: 'white', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 650, fontSize: '0.88rem', textDecoration: 'none' }}>
            <span>📦</span> Bulk Order / Cart
          </Link>
          <Link to="/buyer/track" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#7c3aed', color: 'white', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 650, fontSize: '0.88rem', textDecoration: 'none' }}>
            <span>🗺️</span> Track Goods
          </Link>
        </div>
      </div>

      {/* ─── LIVE RUNNING AGRICULTURAL NEWS TICKER (DD Kisan, Krishi Jagran, ICAR, PIB) ─── */}
      <LiveNewsTicker />

      {/* ─── PERSONAL DASHBOARD: PROFILE, LOCATION & BANK ACCOUNTS ─── */}
      <PersonalDashboardCard role="BUYER" onDataUpdated={() => fetchDashboardData(false)} />

      {/* ─── STATS GRID ───────────────────────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-info">
            <h3>Total Orders Placed</h3>
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
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <h3>Total Mandi Purchases</h3>
            <p className="stat-value">₹{totalSpent.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <Link to="/buyer/track" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ border: '1px solid #7c3aed', background: 'rgba(124, 58, 237, 0.1)', cursor: 'pointer', height: '100%' }}>
            <div className="stat-icon">🗺️</div>
            <div className="stat-info">
              <h3 style={{ color: '#c4b5fd' }}>Live Goods Dispatch Map</h3>
              <p className="stat-value" style={{ fontSize: '0.98rem', color: '#4ade80', marginTop: '4px' }}>
                Track Live Shipments →
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* ─── RECENT ORDERS ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📋</span> My Recent Sourcing Orders
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
              Direct farm purchases with zero intermediary brokerage and verified dispatch tracking
            </p>
          </div>
          <Link to="/buyer/orders" className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: '8px' }}>
            View All Orders →
          </Link>
        </div>

        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Produce Item</th>
                <th>Farmer & Farm</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Track</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No orders placed yet. <Link to="/crops" style={{ color: 'var(--primary)', fontWeight: 650 }}>Browse farm produce</Link> to order directly from farmers.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{order.id}</td>
                    <td>{order.crop?.name || `Order Items (${order.orderItems?.length || 1})`}</td>
                    <td>{order.farmer?.farmName || order.farmer?.user?.firstName || 'Local Farmer'}</td>
                    <td style={{ fontWeight: 700 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-badge status-${(order.status || 'pending').toLowerCase()}`}>
                        {order.status || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <Link 
                        to="/buyer/track"
                        style={{
                          background: 'rgba(124, 58, 237, 0.15)',
                          border: '1px solid #7c3aed',
                          color: '#a78bfa',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 650,
                          textDecoration: 'none'
                        }}
                      >
                        🗺️ Map
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── RECOMMENDED CROPS FOR YOU ────────────────────────────────────── */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🌟</span> Fresh Harvest Recommendations
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
              High-demand wholesale and retail crops currently available from verified regional farms
            </p>
          </div>
          <Link to="/crops" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: '8px' }}>
            Explore All Produce →
          </Link>
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

      {/* ─── MARKET PROCUREMENT INSIGHTS ─────────────────────────────────── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.45rem', marginBottom: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>💡</span> Market Sourcing & Fair Trade Highlights
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {MARKET_INSIGHTS.map(news => (
            <div 
              key={news.id} 
              style={{
                background: 'var(--bg-card)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.5px' }}>
                  {news.tag}
                </span>
                <h4 style={{ margin: '0.4rem 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  {news.icon} {news.title}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, lineHeight: '1.5' }}>
                  {news.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BuyerDashboard
