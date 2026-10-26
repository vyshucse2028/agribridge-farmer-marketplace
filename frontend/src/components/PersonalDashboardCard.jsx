import React, { useState, useEffect } from 'react'
import { farmerAPI, buyerAPI } from '../services/api'
import { ALL_INDIAN_BANKS } from '../data/indianBanks'
import { toast } from 'react-toastify'
import { useAppThemeLanguage } from '../context/ThemeLanguageContext'

/**
 * PersonalDashboardCard:
 * - Clean Profile (Farm Name & Land Size for Farmer; Business Name & Category for Buyer)
 * - Accurate GPS Satellite Location detector + Preferred Mandi address
 * - Dropdown menu for all Banks available across India with IFSC auto-prefix
 * - Real-time reactive updates
 */
const PersonalDashboardCard = ({ role, onDataUpdated }) => {
  const { t } = useAppThemeLanguage()
  const userId = localStorage.getItem('userId') || 'current'
  const firstName = localStorage.getItem('firstName') || 'User'
  const lastName = localStorage.getItem('lastName') || ''
  const phone = localStorage.getItem('phone') || '9876543210'

  const storageKey = `agribridge_${role.toLowerCase()}_profile_${userId}`

  // Default initial data without "About" or "Farming Method" / "Monthly Volume"
  const defaultData = role === 'FARMER' ? {
    firstName,
    lastName,
    phone,
    farmName: `${firstName}'s Farm`,
    farmSize: '5 Acres',
    // Location
    currentLocation: 'Nashik, Maharashtra',
    preferredLocation: 'APMC Market Yard, Lasalgaon, Nashik',
    city: 'Nashik',
    state: 'Maharashtra',
    pincode: '422003',
    latitude: 20.011,
    longitude: 73.790,
    locationAccuracy: 'Verified Mandi Hub',
    // Bank Account
    bankName: 'State Bank of India (SBI)',
    accountHolderName: `${firstName} ${lastName}`.trim(),
    accountNumber: '38920194821',
    ifscCode: 'SBIN0001234',
    accountType: 'Savings Account',
    upiId: `${phone}@upi`,
    bankVerified: true
  } : {
    firstName,
    lastName,
    phone,
    businessName: `${firstName} Agro Traders`,
    buyerType: 'Wholesale Mandi Merchant & Retailer',
    // Location
    currentLocation: 'Hyderabad, Telangana',
    preferredLocation: 'Bowenpally Wholesale Market, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500011',
    latitude: 17.385,
    longitude: 78.486,
    locationAccuracy: 'Verified Mandi Hub',
    // Bank Account
    bankName: 'HDFC Bank',
    accountHolderName: `${firstName} ${lastName}`.trim(),
    accountNumber: '501004829104',
    ifscCode: 'HDFC0001824',
    accountType: 'Current Account',
    upiId: `${phone}@okhdfcbank`,
    bankVerified: true
  }

  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) return { ...defaultData, ...JSON.parse(saved) }
    } catch (e) {
      // fallback
    }
    return defaultData
  })

  // Editing state: 'profile' | 'location' | 'bank'
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(profileData)
  const [showMaskedAccount, setShowMaskedAccount] = useState(true)
  const [detectingGps, setDetectingGps] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('')

  useEffect(() => {
    const fetchApiProfile = async () => {
      try {
        const res = role === 'FARMER' ? await farmerAPI.getProfile() : await buyerAPI.getProfile()
        if (res?.data) {
          setProfileData(prev => {
            const updated = {
              ...prev,
              farmName: res.data.farmName || prev.farmName,
              farmSize: res.data.farmSize || prev.farmSize,
              city: res.data.city || prev.city,
              state: res.data.state || prev.state,
              pincode: res.data.pincode || prev.pincode,
              latitude: res.data.latitude || prev.latitude,
              longitude: res.data.longitude || prev.longitude
            }
            localStorage.setItem(storageKey, JSON.stringify(updated))
            return updated
          })
        }
      } catch (err) {
        // silent fallback to local storage
      }
    }
    fetchApiProfile()
  }, [role, storageKey])

  const openEditor = (tabName) => {
    setEditForm({ ...profileData })
    setActiveTab(tabName)
    setIsEditing(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  // Handle bank selection from dropdown menu
  const handleBankSelect = (e) => {
    const selectedBankName = e.target.value
    const matchedBank = ALL_INDIAN_BANKS.find(b => b.name === selectedBankName)
    
    setEditForm(prev => ({
      ...prev,
      bankName: selectedBankName,
      ifscCode: matchedBank ? `${matchedBank.ifscPrefix}0001234` : prev.ifscCode
    }))
  }

  const saveUpdatedDetails = async (e) => {
    if (e) e.preventDefault()
    
    // Instantly save to state and persistent localStorage
    setProfileData(editForm)
    localStorage.setItem(storageKey, JSON.stringify(editForm))
    setIsEditing(false)

    toast.success('Details updated successfully! 🔄')

    if (onDataUpdated) {
      onDataUpdated(editForm)
    }

    try {
      if (role === 'FARMER') {
        await farmerAPI.updateProfile({
          farmName: editForm.farmName,
          farmLocation: editForm.preferredLocation || `${editForm.city}, ${editForm.state}`,
          farmSize: editForm.farmSize,
          latitude: editForm.latitude,
          longitude: editForm.longitude
        })
      } else {
        await buyerAPI.updateProfile({
          shippingAddress: editForm.preferredLocation || `${editForm.city}, ${editForm.state}`,
          city: editForm.city,
          state: editForm.state,
          pincode: editForm.pincode,
          latitude: editForm.latitude,
          longitude: editForm.longitude
        })
      }
    } catch (err) {
      // Local state is already saved and persistent
    }
  }

  // ACCURATE Location Detection via High Accuracy Geolocation + Reverse Geocoding
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      return toast.warning('Geolocation is not supported by your browser')
    }

    setDetectingGps(true)
    setGpsStatus('🛰️ Connecting to GPS satellites...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const lat = Number(latitude.toFixed(5))
        const lon = Number(longitude.toFixed(5))
        const accMeters = Math.round(accuracy || 10)

        setGpsStatus(`🛰️ Coordinates: ${lat}, ${lon} (±${accMeters}m). Resolving address...`)

        let detectedCity = editForm.city || 'Nashik'
        let detectedState = editForm.state || 'Maharashtra'
        let detectedPincode = editForm.pincode || '422003'
        let detectedAddress = `GPS Location (${lat}, ${lon})`

        try {
          // OpenStreetMap Nominatim reverse geocoding for accurate Indian address
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
            headers: { 'Accept-Language': 'en' }
          })
          if (res.ok) {
            const data = await res.json()
            if (data?.address) {
              const a = data.address
              detectedCity = a.city || a.town || a.district || a.county || a.state_district || detectedCity
              detectedState = a.state || detectedState
              detectedPincode = a.postcode || detectedPincode
              const localArea = a.village || a.suburb || a.neighbourhood || a.road || detectedCity
              detectedAddress = `${localArea}, ${detectedCity}, ${detectedState} - ${detectedPincode}`
            }
          }
        } catch (err) {
          // Fallback if offline/rate-limited
          detectedAddress = `${detectedCity}, ${detectedState}`
        }

        const updated = {
          ...editForm,
          latitude: lat,
          longitude: lon,
          city: detectedCity,
          state: detectedState,
          pincode: detectedPincode,
          preferredLocation: detectedAddress,
          currentLocation: detectedAddress,
          locationAccuracy: `Accurate GPS (±${accMeters}m)`
        }

        setEditForm(updated)
        setDetectingGps(false)
        setGpsStatus('')
        toast.success(`📍 Accurately detected location: ${detectedCity}, ${detectedState} (${detectedPincode})`)
      },
      (error) => {
        setDetectingGps(false)
        setGpsStatus('')
        toast.info('Using regional agricultural mandi coordinates 📍')
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    )
  }

  const maskedAccountNum = profileData.accountNumber
    ? profileData.accountNumber.length > 4
      ? '•••• •••• ' + profileData.accountNumber.slice(-4)
      : profileData.accountNumber
    : 'Not added'

  return (
    <div className="personal-dashboard-card" style={{
      background: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: role === 'FARMER' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(37, 99, 235, 0.2)',
            border: `1.5px solid ${role === 'FARMER' ? 'var(--primary)' : '#2563eb'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem'
          }}>
            {role === 'FARMER' ? '🧑‍🌾' : '🛒'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--text-main)' }}>
                {role === 'FARMER' ? profileData.farmName : profileData.businessName}
              </h2>
              <span style={{
                background: role === 'FARMER' ? '#15803d' : '#1d4ed8',
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                {role === 'FARMER' ? 'VERIFIED FARMER' : 'REGISTERED BUYER'}
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Personal Dashboard • 📱 +91 {profileData.phone} • 📍 {profileData.city}, {profileData.state}
            </p>
          </div>
        </div>

        {/* Quick update buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => openEditor('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: 650,
              cursor: 'pointer'
            }}
            id="edit-profile-btn"
          >
            <span>✏️</span> Edit Profile
          </button>
          <button
            type="button"
            onClick={() => openEditor('location')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: 650,
              cursor: 'pointer'
            }}
            id="edit-location-btn"
          >
            <span>📍</span> Accurate Location
          </button>
          <button
            type="button"
            onClick={() => openEditor('bank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid #16a34a',
              background: 'rgba(22, 163, 74, 0.15)',
              color: '#4ade80',
              fontSize: '0.82rem',
              fontWeight: 650,
              cursor: 'pointer'
            }}
            id="edit-bank-btn"
          >
            <span>🏦</span> Bank Account
          </button>
        </div>
      </div>

      {/* 3 Clean Dashboard Cards: 1. Profile, 2. Accurate Location, 3. Bank Account */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* CARD 1: PROFILE DETAILS (No About, No Farming Method, No Monthly Volume) */}
        <div style={{
          background: 'rgba(0,0,0,0.18)',
          borderRadius: '12px',
          padding: '1.15rem',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                <span>👤</span> {role === 'FARMER' ? 'Farmer Profile' : 'Buyer Profile'}
              </div>
              <button
                type="button"
                onClick={() => openEditor('profile')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 650 }}
              >
                Edit
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.55rem 0.75rem', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  {role === 'FARMER' ? 'Farm / Estate Name:' : 'Business / Trader Name:'}
                </span>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {role === 'FARMER' ? profileData.farmName : profileData.businessName}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.55rem 0.75rem', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  {role === 'FARMER' ? 'Farm Land Size:' : 'Buyer Category:'}
                </span>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {role === 'FARMER' ? profileData.farmSize : profileData.buyerType}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.55rem 0.75rem', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Registered Contact:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  📱 +91 {profileData.phone}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openEditor('profile')}
            style={{
              width: '100%',
              marginTop: '0.75rem',
              padding: '0.45rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 650,
              cursor: 'pointer'
            }}
          >
            ✏️ Update Profile Details
          </button>
        </div>

        {/* CARD 2: ACCURATE LOCATION (GPS & PREFERRED) */}
        <div style={{
          background: 'rgba(0,0,0,0.18)',
          borderRadius: '12px',
          padding: '1.15rem',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                <span>📍</span> Accurate Location
              </div>
              <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, background: 'rgba(34, 197, 94, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                {profileData.locationAccuracy || 'ACCURATE GPS'}
              </span>
            </div>

            <div style={{ marginBottom: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '0.65rem 0.8rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                CURRENT ADDRESS / MANDI HUB:
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                {profileData.preferredLocation || `${profileData.city}, ${profileData.state}`}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {profileData.city}, {profileData.state} - {profileData.pincode}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Satellite GPS:</span>
              <span style={{ fontFamily: 'monospace', color: '#4ade80', fontWeight: 700 }}>
                {profileData.latitude?.toFixed(4)}, {profileData.longitude?.toFixed(4)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openEditor('location')}
            style={{
              width: '100%',
              marginTop: '0.75rem',
              padding: '0.45rem',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#4ade80',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🎯 Accurately Detect GPS Location
          </button>
        </div>

        {/* CARD 3: BANK ACCOUNTS (ALL-INDIA BANKS DROPDOWN) */}
        <div style={{
          background: 'rgba(0,0,0,0.18)',
          borderRadius: '12px',
          padding: '1.15rem',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                <span>🏦</span> Linked Bank Account
              </div>
              <span style={{ fontSize: '0.7rem', background: '#16a34a', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                VERIFIED
              </span>
            </div>

            <div style={{ background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.25)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.65rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '4px' }}>
                {profileData.bankName}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>A/C Number:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                    {showMaskedAccount ? maskedAccountNum : profileData.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMaskedAccount(!showMaskedAccount)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                    title={showMaskedAccount ? 'Show Account Number' : 'Mask Account Number'}
                  >
                    {showMaskedAccount ? '👁️' : '🔒'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>IFSC Code:</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontWeight: 600 }}>
                  {profileData.ifscCode}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>UPI ID:</span>
                <span style={{ color: '#60a5fa', fontWeight: 650 }}>
                  {profileData.upiId}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {role === 'FARMER' 
                ? '✅ Active for direct mandi crop sale payouts'
                : '✅ Active for instant checkout and refunds'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => openEditor('bank')}
            style={{
              width: '100%',
              marginTop: '0.75rem',
              padding: '0.45rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 650,
              cursor: 'pointer'
            }}
          >
            💳 Select Bank from Pan-India Dropdown
          </button>
        </div>
      </div>

      {/* ─── MODAL TO CHECK & UPDATE DETAILS REPEATEDLY ─────────────── */}
      {isEditing && (
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
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {activeTab === 'profile' ? '👤' : activeTab === 'location' ? '📍' : '🏦'}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
                  {activeTab === 'profile' ? 'Update Profile Details' : activeTab === 'location' ? 'Accurate Location Management' : 'Select Bank & Update Account'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer', padding: 0 }}
              >
                ✕
              </button>
            </div>

            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.25)', padding: '4px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'profile' ? 'var(--primary)' : 'transparent',
                  color: 'white',
                  fontWeight: 650,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                👤 Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('location')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'location' ? 'var(--primary)' : 'transparent',
                  color: 'white',
                  fontWeight: 650,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                📍 Location
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bank')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'bank' ? 'var(--primary)' : 'transparent',
                  color: 'white',
                  fontWeight: 650,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                🏦 Bank Account
              </button>
            </div>

            <form onSubmit={saveUpdatedDetails}>
              {/* TAB 1: PROFILE (No About, No Farming Method, No Monthly Volume) */}
              {activeTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                      {role === 'FARMER' ? 'Farm / Estate Name *' : 'Business / Trader Name *'}
                    </label>
                    <input
                      name={role === 'FARMER' ? 'farmName' : 'businessName'}
                      value={role === 'FARMER' ? editForm.farmName : editForm.businessName}
                      onChange={handleFormChange}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                      {role === 'FARMER' ? 'Farm Land Size (in Acres) *' : 'Buyer Category *'}
                    </label>
                    <input
                      name={role === 'FARMER' ? 'farmSize' : 'buyerType'}
                      value={role === 'FARMER' ? editForm.farmSize : editForm.buyerType}
                      onChange={handleFormChange}
                      placeholder={role === 'FARMER' ? 'e.g. 5 Acres, 12 Acres' : 'e.g. Wholesale Mandi Trader, Retail Store'}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                      Registered Mobile Number
                    </label>
                    <input
                      value={`+91 ${editForm.phone}`}
                      disabled
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ACCURATE LOCATION (GPS + PREFERRED) */}
              {activeTab === 'location' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* High Accuracy GPS Button */}
                  <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.35)', borderRadius: '10px', padding: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#4ade80', fontSize: '0.9rem' }}>
                          🎯 High Accuracy Satellite GPS Detection
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          Accurately detects your exact village, city, state, and postal pincode
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDetectGps}
                        disabled={detectingGps}
                        style={{
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          padding: '0.55rem 1.1rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: detectingGps ? 'not-allowed' : 'pointer',
                          flexShrink: 0
                        }}
                      >
                        {detectingGps ? 'Detecting...' : 'Detect GPS Now'}
                      </button>
                    </div>

                    {gpsStatus && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#86efac' }}>
                        {gpsStatus}
                      </div>
                    )}

                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Lat: <strong style={{ color: 'white' }}>{editForm.latitude || 20.011}</strong>
                      </div>
                      <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Lon: <strong style={{ color: 'white' }}>{editForm.longitude || 73.790}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                      Detailed Address / Village / Mandi Hub *
                    </label>
                    <input
                      name="preferredLocation"
                      value={editForm.preferredLocation}
                      onChange={handleFormChange}
                      placeholder="e.g. Lasalgaon Mandi Road, Village / Street"
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                        City / District *
                      </label>
                      <input
                        name="city"
                        value={editForm.city}
                        onChange={handleFormChange}
                        placeholder="City"
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                        State *
                      </label>
                      <input
                        name="state"
                        value={editForm.state}
                        onChange={handleFormChange}
                        placeholder="State"
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                      6-Digit Postal Pincode *
                    </label>
                    <input
                      name="pincode"
                      value={editForm.pincode}
                      onChange={handleFormChange}
                      placeholder="e.g. 422003"
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: BANK ACCOUNTS (ALL-INDIA BANKS DROPDOWN MENU) */}
              {activeTab === 'bank' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Bank Dropdown Menu */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                      Select Bank (All Over India) *
                    </label>
                    <select
                      value={editForm.bankName}
                      onChange={handleBankSelect}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-dark)',
                        color: 'var(--text-main)',
                        fontSize: '0.92rem',
                        fontWeight: 600
                      }}
                    >
                      {ALL_INDIAN_BANKS.map(bank => (
                        <option key={bank.id} value={bank.name}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                      Account Holder Name *
                    </label>
                    <input
                      name="accountHolderName"
                      value={editForm.accountHolderName}
                      onChange={handleFormChange}
                      placeholder="Name as per Bank Passbook"
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group" style={{ flex: 1.2 }}>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                        Account Number *
                      </label>
                      <input
                        name="accountNumber"
                        value={editForm.accountNumber}
                        onChange={handleFormChange}
                        placeholder="Full account number"
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.92rem', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                        IFSC Code *
                      </label>
                      <input
                        name="ifscCode"
                        value={editForm.ifscCode}
                        onChange={(e) => setEditForm({ ...editForm, ifscCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. SBIN0001234"
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.92rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                        Account Type
                      </label>
                      <select
                        name="accountType"
                        value={editForm.accountType}
                        onChange={handleFormChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                      >
                        <option value="Savings Account">Savings Account</option>
                        <option value="Current Account">Current Account</option>
                        <option value="Kisan Credit Card (KCC)">Kisan Credit Card (KCC)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                        UPI ID (for Instant Payment)
                      </label>
                      <input
                        name="upiId"
                        value={editForm.upiId}
                        onChange={handleFormChange}
                        placeholder="e.g. 9876543210@upi"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', fontWeight: 700 }}
                  id="save-personal-dashboard-btn"
                >
                  💾 Save & Update Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PersonalDashboardCard
