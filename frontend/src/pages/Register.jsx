import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI, persistAuth } from '../services/api'
import { toast } from 'react-toastify'
import { useAppThemeLanguage } from '../context/ThemeLanguageContext'

const Register = () => {
  const navigate = useNavigate()
  const { t } = useAppThemeLanguage()
  const [role, setRole] = useState('FARMER')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    farmName: '',
    farmLocation: '',
    shippingAddress: '',
    city: '',
    pincode: '',
  })

  const handleChange = (e) => {
    let val = e.target.value
    if (e.target.name === 'phone') {
      val = val.replace(/\D/g, '').slice(0, 10)
    }
    setForm({ ...form, [e.target.name]: val })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanPhone = form.phone.trim().replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      return toast.warning('Please enter a valid 10-digit Indian mobile number')
    }
    if (form.password.length < 6) {
      return toast.warning('Password must be at least 6 characters')
    }

    setLoading(true)
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        phone: cleanPhone,
        password: form.password,
        role,
        farmName: role === 'FARMER' ? (form.farmName || `${form.firstName}'s Farm`) : undefined,
        farmLocation: role === 'FARMER' ? form.farmLocation : undefined,
        shippingAddress: role === 'BUYER' ? form.shippingAddress : undefined,
        city: role === 'BUYER' ? form.city : undefined,
        pincode: role === 'BUYER' ? form.pincode : undefined,
      }
      const res = await authAPI.register(payload)
      persistAuth(res.data)
      toast.success(`Account created successfully! Welcome to AgriBridge ${role === 'FARMER' ? '🧑‍🌾' : '🛒'}`)
      navigate(role === 'FARMER' ? '/farmer/dashboard' : '/buyer/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Mobile number might already be registered.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="auth-card register-card" style={{ maxWidth: '540px', width: '100%', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.4rem' }}>🌾</span>
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.4rem 0' }}>Join AgriBridge</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Direct Farm-to-Market Platform with Mobile Number Registration
          </p>
        </div>

        {/* Role Selector */}
        <div className="role-selector" style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }} id="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'FARMER' ? 'selected' : ''}`}
            onClick={() => setRole('FARMER')}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '8px',
              border: 'none',
              background: role === 'FARMER' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
            id="select-farmer"
          >
            🌱 Register as Farmer
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'BUYER' ? 'selected' : ''}`}
            onClick={() => setRole('BUYER')}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '8px',
              border: 'none',
              background: role === 'BUYER' ? '#1565c0' : 'rgba(255,255,255,0.05)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
            id="select-buyer"
          >
            🛒 Register as Buyer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          <div className="form-row" style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="firstName" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="e.g. Ramesh"
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="lastName" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                Last Name (optional)
              </label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="e.g. Patel"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.2rem' }}>
            <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
              Mobile Number *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'rgba(255,255,255,0.06)', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>
                +91
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.2rem' }}>
            <label htmlFor="reg-password" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
              Password (Min 6 characters) *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                style={{ width: '100%', padding: '0.75rem 2.8rem 0.75rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                id="toggle-register-password"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.15rem',
                  padding: '4px',
                  color: 'var(--text-muted)'
                }}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          {/* Farmer-specific fields */}
          {role === 'FARMER' && (
            <>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label htmlFor="farmName" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                  Farm / Estate Name (optional)
                </label>
                <input
                  id="farmName"
                  name="farmName"
                  value={form.farmName}
                  onChange={handleChange}
                  placeholder="e.g. Green Harvest Farms"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                <label htmlFor="farmLocation" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                  Farm Location (Village / District / State)
                </label>
                <input
                  id="farmLocation"
                  name="farmLocation"
                  value={form.farmLocation}
                  onChange={handleChange}
                  placeholder="e.g. Nashik, Maharashtra"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                />
              </div>
            </>
          )}

          {/* Buyer-specific fields */}
          {role === 'BUYER' && (
            <>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label htmlFor="shippingAddress" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                  Delivery / Mandi Business Address
                </label>
                <input
                  id="shippingAddress"
                  name="shippingAddress"
                  value={form.shippingAddress}
                  onChange={handleChange}
                  placeholder="Shop / Warehouse address or Street name"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '10px', marginBottom: '1.4rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="city" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                    City / Town
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="pincode" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                    Pincode
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="6-digit Pincode"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                  />
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn-auth-submit" 
            disabled={loading} 
            id="register-submit"
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '8px',
              border: 'none',
              background: role === 'FARMER' ? 'var(--primary)' : '#1565c0',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'FARMER' ? 'Farmer' : 'Buyer'}`}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Login with Mobile
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
