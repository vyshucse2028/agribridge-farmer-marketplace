import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI, persistAuth } from '../services/api'
import { toast } from 'react-toastify'

const Register = () => {
  const navigate = useNavigate()
  const [role, setRole] = useState('FARMER')
  const [loading, setLoading] = useState(false)
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
    if (!form.phone || form.phone.length < 10) {
      return toast.warning('Please enter a valid 10-digit Indian mobile number')
    }
    if (form.password.length < 6) {
      return toast.warning('Password must be at least 6 characters')
    }

    setLoading(true)
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role,
        farmName: role === 'FARMER' ? form.farmName : undefined,
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
      toast.error(err.response?.data?.message || 'Registration failed. Mobile number might already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <span className="auth-logo">🌾</span>
          <h1>Join AgriBridge</h1>
          <p>Direct Farm-to-Market Connection with Mobile Login</p>
        </div>

        {/* Role Selector */}
        <div className="role-selector" id="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'FARMER' ? 'selected' : ''}`}
            onClick={() => setRole('FARMER')}
            id="select-farmer"
          >
            🌱 Register as Farmer
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'BUYER' ? 'selected' : ''}`}
            onClick={() => setRole('BUYER')}
            id="select-buyer"
          >
            🛒 Register as Buyer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="e.g. Ramesh"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="e.g. Kumar"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Mobile Number *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#2a2a2a', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#aaa', fontWeight: 600 }}>
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
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password (Minimum 6 characters) *</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {/* Farmer-specific fields */}
          {role === 'FARMER' && (
            <>
              <div className="form-group">
                <label htmlFor="farmName">Farm / Estate Name</label>
                <input
                  id="farmName"
                  name="farmName"
                  value={form.farmName}
                  onChange={handleChange}
                  placeholder="e.g. Green Valley Farm"
                />
              </div>
              <div className="form-group">
                <label htmlFor="farmLocation">Farm Location (Village / District / State)</label>
                <input
                  id="farmLocation"
                  name="farmLocation"
                  value={form.farmLocation}
                  onChange={handleChange}
                  placeholder="e.g. Nashik, Maharashtra"
                />
              </div>
            </>
          )}

          {/* Buyer-specific fields */}
          {role === 'BUYER' && (
            <>
              <div className="form-group">
                <label htmlFor="shippingAddress">Delivery / Shipping Address</label>
                <input
                  id="shippingAddress"
                  name="shippingAddress"
                  value={form.shippingAddress}
                  onChange={handleChange}
                  placeholder="Street address, Apartment or Business name"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    id="pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="6-digit Pincode"
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-auth-submit" disabled={loading} id="register-submit">
            {loading ? 'Creating Account...' : `Register as ${role === 'FARMER' ? 'Farmer' : 'Buyer'}`}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login with Mobile</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
