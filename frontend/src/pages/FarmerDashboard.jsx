import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cropAPI, orderAPI } from '../services/api'
import CropCard from '../components/CropCard'
import PersonalDashboardCard from '../components/PersonalDashboardCard'
import LiveNewsTicker from '../components/LiveNewsTicker'
import { toast } from 'react-toastify'
import { useAppThemeLanguage } from '../context/ThemeLanguageContext'
import '../styles/Dashboard.css'

// Dynamic agriculture news — timestamps are generated relative to current date/time
const getAgricultureNews = (currentDate) => {
  const dateStr = currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const monthStr = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const timeStr = currentDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

  return [
    {
      id: 1,
      category: 'Mandi Price Bulletin',
      badge: 'LIVE RATES',
      title: 'Daily APMC Mandi Rate Movement Across States',
      date: dateStr,
      time: timeStr,
      summary: 'Tomato arrivals in Lasalgaon & Kolar show steady wholesale prices between ₹28-₹35/kg. Onion modal prices in Pimpalgaon steady at ₹38/kg. Wheat MSP procurement targets surpassed in northern states.',
      details: 'Traders report increased direct farmer-to-consumer demand across tier-1 and tier-2 corridors.',
      icon: '📊'
    },
    {
      id: 2,
      category: 'Government Schemes & Subsidies',
      badge: 'POLICY ALERT',
      title: 'PM-KISAN Direct Benefit Installment Disbursed',
      date: monthStr,
      time: '11:00 AM',
      summary: 'Financial support transferred directly to Aadhaar-linked bank accounts of verified farmers. Digital grievance redressal cell active for delayed bank KYC.',
      details: 'Farmers can verify their beneficiary status and bank integration via PM-KISAN official portal.',
      icon: '🏛️'
    },
    {
      id: 3,
      category: 'Weather & Agrometeorology',
      badge: 'MET ADVISORY',
      title: 'Regional Weather Forecast: Favorable Soil Moisture for Sowing',
      date: dateStr,
      time: '07:15 AM',
      summary: 'Widespread post-monsoon showers recorded across Central and Southern agricultural belts. Experts recommend expedited seedbed preparation for winter vegetables & pulses.',
      details: 'Optimal sowing window active for the next 14 days before night temperatures drop.',
      icon: '🌦️'
    },
    {
      id: 4,
      category: 'Crop Protection & Bio-Inputs',
      badge: 'FARM ADVISORY',
      title: 'Natural Pest Management & Bio-Fertilizer Subsidy Active',
      date: dateStr,
      time: '02:00 PM',
      summary: 'State Agriculture Departments announce 50% subsidy on neem-based pesticides, pheromone traps, and Trichoderma bio-fungicides to promote residue-free cultivation.',
      details: 'Contact your local Krishi Vigyan Kendra (KVK) or block agriculture officer to avail subsidy vouchers.',
      icon: '🌱'
    },
    {
      id: 5,
      category: 'Logistics & Fair Trade',
      badge: 'MARKET NEWS',
      title: 'Direct Farm-to-Buyer Cold Logistics Expansion Announced',
      date: dateStr,
      time: '04:45 PM',
      summary: 'Elimination of intermediary brokers on AgriBridge has helped local farmers retain 25-30% higher margins compared to traditional yard auctions.',
      details: 'Doorstep pickup logistics fleet expanded to cover over 45 new rural clusters.',
      icon: '🚚'
    },
    {
      id: 6,
      category: 'Seasonal Crop Calendar',
      badge: 'SEASON UPDATE',
      title: `Rabi Season Crop Planning Guide — ${monthStr}`,
      date: dateStr,
      time: timeStr,
      summary: 'Optimal time for sowing wheat, barley, mustard, chickpea, and leafy greens. Soil preparation and irrigation scheduling recommended for maximum yield.',
      details: 'Consult ICAR guidelines for hybrid seed selection and fertilizer dosing rates for your agro-climatic zone.',
      icon: '🗓️'
    }
  ]
}

const FarmerDashboard = () => {
  const { t } = useAppThemeLanguage()
  const [crops, setCrops] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  
  // Quick Update Crop Modal state
  const [editingCrop, setEditingCrop] = useState(null)
  const [updateForm, setUpdateForm] = useState({
    name: '',
    pricePerUnit: '',
    unit: 'kg',
    availableQuantity: '',
    available: true
  })
  const [updating, setUpdating] = useState(false)

  const firstName = localStorage.getItem('firstName') || 'Farmer'

  // Live running clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true)
      const [cropsRes, ordersRes] = await Promise.all([
        cropAPI.getMyCrops(),
        orderAPI.getMyFarmerOrders()
      ])
      setCrops(cropsRes.data)
      setOrders(ordersRes.data)
      if (showToast) {
        toast.success('Dashboard data refreshed successfully! 🔄')
      }
    } catch (error) {
      toast.error('Failed to load farmer market data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleDeleteCrop = async (cropId) => {
    if (window.confirm('Are you sure you want to delete this crop listing?')) {
      try {
        await cropAPI.delete(cropId)
        toast.success('Crop deleted successfully')
        fetchDashboardData()
      } catch (error) {
        toast.error('Failed to delete crop')
      }
    }
  }

  const openQuickUpdate = (crop) => {
    setEditingCrop(crop)
    setUpdateForm({
      name: crop.name || '',
      pricePerUnit: crop.pricePerUnit || '',
      unit: crop.unit || 'kg',
      availableQuantity: crop.availableQuantity || '',
      available: crop.available !== undefined ? crop.available : true
    })
  }

  const handleQuickUpdateSubmit = async (e) => {
    e.preventDefault()
    if (!editingCrop) return
    if (!updateForm.name.trim()) return toast.warning('Crop name is required')
    if (!updateForm.pricePerUnit || Number(updateForm.pricePerUnit) <= 0) return toast.warning('Enter a valid price')
    if (!updateForm.availableQuantity || Number(updateForm.availableQuantity) < 0) return toast.warning('Enter valid quantity')

    setUpdating(true)
    try {
      const payload = {
        name: updateForm.name.trim(),
        pricePerUnit: Number(updateForm.pricePerUnit),
        unit: updateForm.unit,
        availableQuantity: Number(updateForm.availableQuantity),
        available: updateForm.available
      }
      await cropAPI.update(editingCrop.id, payload)
      toast.success(`✅ ${updateForm.name} updated successfully!`)
      setEditingCrop(null)
      fetchDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update crop listing')
    } finally {
      setUpdating(false)
    }
  }

  // Format date and time
  const formattedDate = currentDateTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const formattedTime = currentDateTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })

  const liveNews = getAgricultureNews(currentDateTime)

  if (loading) return <div className="loader" style={{ textAlign: 'center', padding: '3rem' }}>Loading Farmer Portal...</div>

  return (
    <div className="dashboard-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Real-time Running Date, Month, Time Header (Clean emerald & dark forest tones, NO yellow highlights) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(21, 128, 61, 0.2) 0%, rgba(15, 23, 42, 0.4) 100%)',
        padding: '1.5rem 1.75rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: '#22c55e', 
              boxShadow: '0 0 10px #22c55e'
            }} />
            <span style={{ fontSize: '0.82rem', color: '#86efac', fontWeight: 700, letterSpacing: '0.5px' }}>
              LIVE RUNNING AGRICULTURAL BULLETIN
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            Farmer Portal & Real-Time Mandi Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.92rem' }}>
            Welcome, <strong>{firstName}</strong> 🧑‍🌾 • Verified Indian Farmer Network
          </p>
        </div>

        {/* Live Clock & Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{
            background: 'var(--bg-card)',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            textAlign: 'right'
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
              📅 {formattedDate}
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace' }}>
              ⏰ {formattedTime}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Refresh and update dashboard instantly"
              id="refresh-dashboard-btn"
            >
              <span>🔄</span> {refreshing ? 'Updating...' : 'Refresh Data'}
            </button>
            <Link 
              to="/farmer/add-crop" 
              style={{
                background: '#15803d',
                color: 'white',
                textDecoration: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 650,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              id="add-crop-link"
            >
              <span>🌾</span> + Add Crop
            </Link>
            <Link
              to="/farmer/track"
              style={{
                background: '#1d4ed8',
                color: 'white',
                textDecoration: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 650,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🗺️</span> Track Map
            </Link>
          </div>
        </div>
      </div>

      {/* ─── LIVE RUNNING AGRICULTURAL NEWS TICKER (DD Kisan, Krishi Jagran, ICAR, PIB) ─── */}
      <LiveNewsTicker />

      {/* ─── PERSONAL DASHBOARD: PROFILE, LOCATION & BANK ACCOUNTS ─── */}
      <PersonalDashboardCard role="FARMER" onDataUpdated={() => fetchDashboardData(false)} />

      {/* ─── REAL-TIME STATS GRID ─────────────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon">🌾</div>
          <div className="stat-info">
            <h3>Active Crop Listings</h3>
            <p className="stat-value">{crops.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Orders Received</h3>
            <p className="stat-value">{orders.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Direct Mandi Payouts</h3>
            <p className="stat-value">
              ₹{orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <p className="stat-value">
              {orders.filter(o => o.status === 'PENDING').length}
            </p>
          </div>
        </div>
      </div>

      {/* ─── CROPS LISTED BY FARMER ───────────────────────────────────────── */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🌱</span> My Listed Crops
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
              Direct mandi crop listings available for purchase by verified buyers
            </p>
          </div>
          <Link to="/farmer/add-crop" className="btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem', borderRadius: '8px' }}>
            + Add New Crop Listing
          </Link>
        </div>

        {crops.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '12px' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>🌾</span>
            <h3>No Crops Listed Yet</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0.5rem auto 1.5rem' }}>
              List your fresh harvest (Cereals, Pulses, Fruits, Vegetables, Leafy Vegetables, Spices) to start receiving direct orders.
            </p>
            <Link to="/farmer/add-crop" className="btn-primary">
              + Add Your First Crop Listing
            </Link>
          </div>
        ) : (
          <div className="crops-grid">
            {crops.map(crop => (
              <CropCard 
                key={crop.id} 
                crop={crop} 
                showActions={true}
                onEdit={openQuickUpdate}
                onDelete={handleDeleteCrop}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── RECENT ORDERS TABLE ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📦</span> Recent Buyer Orders
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
              Orders placed by commercial traders and consumers with direct bank settlements
            </p>
          </div>
          <Link to="/farmer/orders" className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: '8px' }}>
            View All Orders →
          </Link>
        </div>

        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Crop / Items</th>
                <th>Buyer</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No orders received yet. Active crop listings will receive direct buyer bookings.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{order.id}</td>
                    <td>{order.crop?.name || `Order Items (${order.orderItems?.length || 1})`}</td>
                    <td>{order.buyer?.user?.firstName || 'Registered Buyer'}</td>
                    <td style={{ fontWeight: 700 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-badge status-${(order.status || 'pending').toLowerCase()}`}>
                        {order.status || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── LIVE AGRICULTURAL BULLETIN & NEWS ───────────────────────────── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📰</span> Current Running Agriculture & Mandi News
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
              Real-time agricultural intelligence: APMC wholesale rates, weather alerts, central schemes, and ICAR sowing calendars.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
          {liveNews.map(news => (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px' }}>
                    {news.badge}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {news.time}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  {news.icon} {news.title}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.5', margin: '0 0 0.75rem 0' }}>
                  {news.summary}
                </p>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                💡 {news.details}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── QUICK UPDATE MODAL (No description, adjusted tick mark) ────── */}
      {editingCrop && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            maxWidth: '480px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>⚡ Quick Update Crop Listing</h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Editing: <strong>{editingCrop.name}</strong>
                </p>
              </div>
              <button 
                onClick={() => setEditingCrop(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickUpdateSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Crop Name *
                </label>
                <input 
                  value={updateForm.name} 
                  onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', fontSize: '0.92rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Price (₹) *
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={updateForm.pricePerUnit} 
                    onChange={(e) => setUpdateForm({ ...updateForm, pricePerUnit: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', fontSize: '0.92rem' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Unit *
                  </label>
                  <select 
                    value={updateForm.unit} 
                    onChange={(e) => setUpdateForm({ ...updateForm, unit: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', fontSize: '0.92rem' }}
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="tonne">tonne</option>
                    <option value="bunch">bunch</option>
                    <option value="dozen">dozen</option>
                    <option value="bag">bag</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Available Quantity ({updateForm.unit}) *
                </label>
                <input 
                  type="number"
                  min="0"
                  value={updateForm.availableQuantity} 
                  onChange={(e) => setUpdateForm({ ...updateForm, availableQuantity: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', fontSize: '0.92rem' }}
                />
              </div>

              {/* In Stock Tick Mark & Label Adjusted Cleanly Together */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '0.75rem 1rem', 
                  background: 'var(--bg-dark)', 
                  borderRadius: '8px',
                  border: `1.5px solid ${updateForm.available ? 'var(--primary)' : 'var(--border-color)'}`,
                  marginBottom: '1.5rem',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onClick={() => setUpdateForm({ ...updateForm, available: !updateForm.available })}
              >
                <input 
                  type="checkbox" 
                  id="modal-available" 
                  checked={updateForm.available} 
                  onChange={(e) => setUpdateForm({ ...updateForm, available: e.target.checked })}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer', margin: 0 }}
                />
                <label htmlFor="modal-available" style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <span>{updateForm.available ? '✅ In Stock' : '❌ Out of Stock'}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                    {updateForm.available ? '(Buyers can place orders)' : '(Marked unavailable)'}
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px' }}
                  onClick={() => setEditingCrop(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', fontWeight: 700 }}
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerDashboard
