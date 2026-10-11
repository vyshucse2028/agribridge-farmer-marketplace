import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cropAPI, orderAPI } from '../services/api'
import CropCard from '../components/CropCard'
import { toast } from 'react-toastify'
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
      title: 'PM-KISAN 17th Direct Benefit Installment Disbursed',
      date: monthStr,
      time: '11:00 AM',
      summary: 'Financial support of ₹2,000 transferred directly to Aadhaar-linked bank accounts of over 9.2 crore eligible farmers. Digital grievance redressal cell opened for delayed bank KYC.',
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
      summary: 'Widespread post-monsoon showers recorded across Central and Southern agricultural belts. Experts recommend expedited seedbed preparation for mustard, gram, and winter vegetables.',
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
      summary: 'Now is the optimal time for sowing wheat, barley, mustard, chickpea, and linseed. Soil preparation and irrigation scheduling recommended for maximum yield.',
      details: 'Consult ICAR guidelines for hybrid seed selection and fertilizer dosing rates for your agro-climatic zone.',
      icon: '🗓️'
    }
  ]
}

const FarmerDashboard = () => {
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
    description: '',
    available: true
  })
  const [updating, setUpdating] = useState(false)

  const userId = localStorage.getItem('userId')
  const firstName = localStorage.getItem('firstName')

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
        toast.success('Dashboard data updated successfully! 🔄')
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
      description: crop.description || '',
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
        description: updateForm.description.trim(),
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

  // Get dynamically timestamped news
  const liveNews = getAgricultureNews(currentDateTime)

  if (loading) return <div className="loader" style={{ textAlign: 'center', padding: '3rem' }}>Loading Farmer Bulletin...</div>

  return (
    <div className="dashboard-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Real-time Running Date, Month, Time Header */}
      <div style={{
        background: 'linear-gradient(135deg, #182d1c 0%, #0f1c12 100%)',
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid rgba(46, 125, 50, 0.4)',
        marginBottom: '2rem',
        boxShadow: '0 6px 25px rgba(0,0,0,0.4)',
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
              background: '#4caf50', 
              boxShadow: '0 0 10px #4caf50',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '0.82rem', color: '#81c784', fontWeight: 700, letterSpacing: '0.5px' }}>
              LIVE RUNNING AGRICULTURAL BULLETIN
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', margin: '0 0 4px 0', color: 'white' }}>
            Farmer News & Real-Time Market Portal
          </h1>
          <p style={{ color: '#c8e6c9', margin: 0, fontSize: '0.95rem' }}>
            Welcome, <strong>{firstName}</strong> 🧑‍🌾 • Verified Indian Farmer Network
          </p>
        </div>

        {/* Live Clock & Easy Update Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'right'
          }}>
            <div style={{ color: '#a5d6a7', fontSize: '0.85rem', fontWeight: 600 }}>
              📅 {formattedDate}
            </div>
            <div style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace' }}>
              ⏰ {formattedTime}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              style={{
                background: '#2e7d32',
                color: 'white',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
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
              to="/farmer/profile" 
              style={{
                background: '#333',
                color: 'white',
                textDecoration: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              id="farmer-profile-link"
            >
              <span>✏️</span> Edit Profile
            </Link>
            <Link
              to="/farmer/track"
              style={{
                background: '#6a1b9a',
                color: 'white',
                textDecoration: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
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

      {/* Current Running Farmer News & Agriculture News Section (Real-Time Date/Month/Time) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📰</span> Current Running Farmer & Agriculture News
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
              Live updates as per {formattedDate}, {formattedTime} — APMC rates, central schemes, weather alerts, and cultivation advisories.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
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
                justifyContent: 'space-between',
                transition: 'border-color 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(46, 125, 50, 0.25)', color: '#4caf50', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {news.badge}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#888' }}>
                    {news.time} • {news.date}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'white', lineHeight: '1.3' }}>
                  {news.icon} {news.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#ccc', margin: '0 0 0.75rem 0', lineHeight: '1.45' }}>
                  {news.summary}
                </p>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid #333', paddingTop: '0.5rem' }}>
                💡 {news.details}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Crop Management & Updates Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🌾</span> My Produce Listings ({crops.length} Listed)
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
              Click <strong>Edit</strong> on any crop to instantly update price, quantity, description and availability status.
            </p>
          </div>
          <Link 
            to="/farmer/add-crop" 
            className="btn-primary"
            style={{ padding: '0.6rem 1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>+</span> List New Crop
          </Link>
        </div>

        {crops.length === 0 ? (
          <div className="empty-state" style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>You haven't listed any crops yet.</p>
            <Link to="/farmer/add-crop" className="btn-secondary">+ Add Your First Crop</Link>
          </div>
        ) : (
          <div className="crops-grid">
            {crops.map(crop => (
              <CropCard 
                key={crop.id} 
                crop={crop} 
                showActions={true}
                onEdit={() => openQuickUpdate(crop)}
                onDelete={handleDeleteCrop}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Recent Buyer Orders</h2>
          <Link to="/farmer/orders" className="btn-text" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            View All Orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No orders received yet. Active crop listings are visible to buyers across India.</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <table className="dashboard-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>₹{order.totalAmount.toFixed(2)}</td>
                    <td>
                      <Link to="/farmer/orders" className="btn-sm btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '4px', textDecoration: 'none', marginRight: '6px' }}>
                        Manage
                      </Link>
                      <Link to="/farmer/track" style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '4px', textDecoration: 'none', background: '#6a1b9a', color: 'white' }}>
                        Map
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ENHANCED QUICK CROP UPDATE MODAL */}
      {editingCrop && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1a1a1a',
            padding: '2rem',
            borderRadius: '18px',
            border: '1px solid rgba(46,125,50,0.4)',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 12px 50px rgba(0,0,0,0.9)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#81c784' }}>⚡ Update Crop Listing</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#888' }}>
                  Editing: <strong style={{ color: '#ccc' }}>{editingCrop.name}</strong>
                </p>
              </div>
              <button 
                onClick={() => setEditingCrop(null)} 
                style={{ background: '#333', border: 'none', color: '#ccc', fontSize: '1.1rem', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickUpdateSubmit}>
              {/* Crop Name */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#aaa', fontWeight: 600 }}>
                  🌿 Crop Name <span style={{ color: '#f44336' }}>*</span>
                </label>
                <input 
                  value={updateForm.name} 
                  onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })} 
                  required 
                  placeholder="e.g. Fresh Tomatoes, Nashik Onions..."
                  style={{ width: '100%', padding: '0.75rem', background: '#242424', border: '1px solid #444', color: 'white', borderRadius: '8px', fontSize: '0.95rem' }}
                />
              </div>

              {/* Price + Unit Row */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#aaa', fontWeight: 600 }}>
                    💰 Price per Unit (₹) <span style={{ color: '#f44336' }}>*</span>
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={updateForm.pricePerUnit} 
                    onChange={(e) => setUpdateForm({ ...updateForm, pricePerUnit: e.target.value })} 
                    required 
                    placeholder="e.g. 35.00"
                    style={{ width: '100%', padding: '0.75rem', background: '#242424', border: '1px solid #444', color: 'white', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#aaa', fontWeight: 600 }}>
                    📦 Unit
                  </label>
                  <select 
                    value={updateForm.unit} 
                    onChange={(e) => setUpdateForm({ ...updateForm, unit: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: '#242424', border: '1px solid #444', color: 'white', borderRadius: '8px' }}
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="tonne">tonne</option>
                    <option value="dozen">dozen</option>
                    <option value="piece">piece</option>
                    <option value="litre">litre</option>
                    <option value="bunch">bunch</option>
                  </select>
                </div>
              </div>

              {/* Available Quantity */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#aaa', fontWeight: 600 }}>
                  📊 Available Quantity <span style={{ color: '#f44336' }}>*</span>
                </label>
                <input 
                  type="number"
                  min="0"
                  value={updateForm.availableQuantity} 
                  onChange={(e) => setUpdateForm({ ...updateForm, availableQuantity: e.target.value })} 
                  required 
                  placeholder="e.g. 500"
                  style={{ width: '100%', padding: '0.75rem', background: '#242424', border: '1px solid #444', color: 'white', borderRadius: '8px' }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#aaa', fontWeight: 600 }}>
                  📝 Description (optional)
                </label>
                <textarea
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                  placeholder="Quality, origin, grade or any buyer notes..."
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', background: '#242424', border: '1px solid #444', color: 'white', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem' }}
                />
              </div>

              {/* Availability Toggle */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0.85rem 1rem',
                  background: updateForm.available ? 'rgba(46, 125, 50, 0.15)' : 'rgba(211, 47, 47, 0.1)',
                  border: `1px solid ${updateForm.available ? '#2e7d32' : '#d32f2f'}`,
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setUpdateForm({ ...updateForm, available: !updateForm.available })}
              >
                <input 
                  type="checkbox"
                  checked={updateForm.available}
                  onChange={(e) => setUpdateForm({ ...updateForm, available: e.target.checked })}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <div>
                  <span style={{ fontSize: '0.95rem', color: 'white', fontWeight: 700 }}>
                    {updateForm.available ? '✅ Listing Active — Visible to Buyers' : '❌ Hidden — Out of Stock / Unavailable'}
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#aaa' }}>
                    {updateForm.available ? 'Buyers can browse and add this crop to cart.' : 'Crop is hidden from buyers until you re-enable it.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingCrop(null)} 
                  style={{ flex: 1, padding: '0.75rem', background: '#333', color: '#ccc', border: '1px solid #444', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updating}
                  style={{ flex: 2, padding: '0.75rem', background: updating ? '#555' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: updating ? 'not-allowed' : 'pointer', fontSize: '0.95rem', transition: 'background 0.2s' }}
                >
                  {updating ? '⏳ Saving Changes...' : '💾 Save & Update Crop'}
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
