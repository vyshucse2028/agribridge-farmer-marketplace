import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI, persistAuth } from '../services/api'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  
  // Login modes: 'PASSWORD' | 'OTP' | 'FORGOT'
  const [authMode, setAuthMode] = useState('PASSWORD')
  const [userRole, setUserRole] = useState('FARMER') // Default highlight for Farmer / Buyer
  const [otpChannel, setOtpChannel] = useState('SMS') // 'SMS' or 'WHATSAPP'
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  // Form states
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    if (!phone.trim()) {
      return toast.warning('Please enter your mobile number')
    }
    if (!password.trim()) {
      return toast.warning('Please enter your password')
    }

    setLoading(true)
    try {
      const res = await authAPI.login({ phone: phone.trim(), password })
      handleLoginSuccess(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (purpose = 'LOGIN') => {
    if (!phone.trim() || phone.trim().length < 10) {
      return toast.warning('Please enter a valid 10-digit mobile number')
    }

    setLoading(true)
    try {
      const res = await authAPI.sendOtp({
        phone: phone.trim(),
        channel: otpChannel,
        type: purpose
      })
      setOtpSent(true)
      setOtp('') // User must type the received code
      toast.success(res.data.message || `OTP sent to +91 ${phone} via ${otpChannel}. Please check your phone.`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpLogin = async (e) => {
    e.preventDefault()
    if (!phone.trim()) return toast.warning('Please enter your mobile number')
    if (!otp.trim()) return toast.warning('Please enter the OTP received on your phone')

    setLoading(true)
    try {
      const res = await authAPI.otpLogin({
        phone: phone.trim(),
        otp: otp.trim(),
        channel: otpChannel,
        role: userRole
      })
      handleLoginSuccess(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP code. Please enter the correct OTP sent to your phone.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!phone.trim()) return toast.warning('Please enter your mobile number')
    if (!otp.trim()) return toast.warning('Please enter the OTP received on your phone')
    if (!newPassword || newPassword.length < 6) {
      return toast.warning('Password must be at least 6 characters')
    }

    setLoading(true)
    try {
      const res = await authAPI.forgotPassword({
        phone: phone.trim(),
        otp: otp.trim(),
        newPassword: newPassword,
        channel: otpChannel
      })
      toast.success(res.data.message || 'Password reset successfully! Please log in.')
      setAuthMode('PASSWORD')
      setPassword('')
      setOtp('')
      setOtpSent(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed. Please check your OTP.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (kind) => {
    setAuthMode('PASSWORD')
    if (kind === 'FARMER') {
      setUserRole('FARMER')
      setPhone('9876543210')
      setPassword('Farmer@123')
    } else {
      setUserRole('BUYER')
      setPhone('9876543211')
      setPassword('Buyer@123')
    }
  }

  const handleLoginSuccess = (data) => {
    persistAuth(data)
    toast.success(`Welcome back, ${data.firstName || 'User'}! 🌾`)
    const dashMap = { FARMER: '/farmer/dashboard', BUYER: '/buyer/dashboard', ADMIN: '/admin/dashboard' }
    navigate(dashMap[data.role] || '/')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Role Switcher */}
        <div className="role-selector" style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`role-btn ${userRole === 'FARMER' ? 'selected' : ''}`}
            onClick={() => setUserRole('FARMER')}
            id="login-tab-farmer"
          >
            🧑‍🌾 Farmer Login
          </button>
          <button
            type="button"
            className={`role-btn ${userRole === 'BUYER' ? 'selected' : ''}`}
            onClick={() => setUserRole('BUYER')}
            id="login-tab-buyer"
          >
            🛒 Buyer Login
          </button>
        </div>

        <div className="auth-header">
          <span className="auth-logo">{userRole === 'FARMER' ? '🧑‍🌾' : '🛒'}</span>
          <h1>{userRole === 'FARMER' ? 'Farmer Portal' : 'Buyer Portal'}</h1>
          <p>
            {authMode === 'FORGOT' 
              ? 'Reset your password via Mobile OTP'
              : `Secure login for ${userRole === 'FARMER' ? 'Farmers' : 'Buyers'} via Mobile`}
          </p>
        </div>

        {/* Auth Sub-mode Selector (Password vs OTP) */}
        {authMode !== 'FORGOT' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#222', padding: '4px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setAuthMode('PASSWORD')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: '6px',
                background: authMode === 'PASSWORD' ? 'var(--primary)' : 'transparent',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              🔑 Password Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('OTP')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: '6px',
                background: authMode === 'OTP' ? 'var(--primary)' : 'transparent',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              ⚡ Mobile OTP (SMS/WhatsApp)
            </button>
          </div>
        )}

        {/* 1. PASSWORD LOGIN FORM */}
        {authMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="auth-form" id="login-form">
            <div className="form-group">
              <label htmlFor="login-phone">Mobile Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#2a2a2a', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#aaa', fontWeight: 600 }}>
                  +91
                </span>
                <input
                  id="login-phone"
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => { setAuthMode('FORGOT'); setOtpSent(false); setOtp(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}
                  id="forgot-password-link"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading} id="login-submit">
              {loading ? 'Logging in...' : `Login as ${userRole === 'FARMER' ? 'Farmer' : 'Buyer'}`}
            </button>
            <div style={{ marginTop: '1rem', padding: '0.85rem', background: '#1c2e1f', borderRadius: '8px', border: '1px solid #2e7d32' }}>
              <div style={{ fontSize: '0.82rem', color: '#81c784', fontWeight: 600, marginBottom: '0.5rem' }}>Quick demo login</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => fillDemo('FARMER')} style={{ flex: 1, padding: '0.45rem', borderRadius: '6px', border: 'none', background: '#2e7d32', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                  Fill Farmer (9876543210)
                </button>
                <button type="button" onClick={() => fillDemo('BUYER')} style={{ flex: 1, padding: '0.45rem', borderRadius: '6px', border: 'none', background: '#1565c0', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                  Fill Buyer (9876543211)
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '6px' }}>
                Farmer password: Farmer@123 · Buyer password: Buyer@123
              </div>
            </div>
          </form>
        )}

        {/* 2. OTP LOGIN FORM (SMS or WhatsApp) — No demo OTP shown */}
        {authMode === 'OTP' && (
          <form onSubmit={handleOtpLogin} className="auth-form" id="otp-login-form">
            <div className="form-group">
              <label htmlFor="otp-phone">Mobile Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#2a2a2a', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#aaa', fontWeight: 600 }}>
                  +91
                </span>
                <input
                  id="otp-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </div>

            {/* Channel Selection (SMS or WhatsApp) */}
            <div className="form-group">
              <label>Receive Code via:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setOtpChannel('SMS')}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: otpChannel === 'SMS' ? 'var(--primary)' : 'var(--border-color)',
                    background: otpChannel === 'SMS' ? 'rgba(46, 125, 50, 0.25)' : '#2a2a2a',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.88rem'
                  }}
                >
                  📱 SMS Message
                </button>
                <button
                  type="button"
                  onClick={() => setOtpChannel('WHATSAPP')}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: otpChannel === 'WHATSAPP' ? '#25D366' : 'var(--border-color)',
                    background: otpChannel === 'WHATSAPP' ? 'rgba(37, 211, 102, 0.25)' : '#2a2a2a',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.88rem'
                  }}
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem' }}
                onClick={() => handleSendOtp('LOGIN')}
                disabled={loading}
                id="send-otp-btn"
              >
                {loading ? 'Sending...' : (otpSent ? `Resend OTP via ${otpChannel}` : `Send OTP via ${otpChannel}`)}
              </button>
            </div>

            {otpSent && (
              <>
                <div style={{ background: '#1c2e1f', border: '1px solid #2e7d32', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#81c784', fontWeight: 600, marginBottom: '2px' }}>
                    <span>📲</span> OTP Sent Successfully
                  </div>
                  <div style={{ color: '#ccc' }}>
                    A 6-digit verification code has been sent to <strong>+91 {phone}</strong> via {otpChannel}. Please check your phone and enter the code below.
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="otp-input">Enter 6-digit OTP Code</label>
                  <input
                    id="otp-input"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn-auth-submit" disabled={loading || !otpSent} id="verify-otp-submit">
              {loading ? 'Verifying...' : 'Verify OTP & Login'}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM — No demo OTP shown */}
        {authMode === 'FORGOT' && (
          <form onSubmit={handleResetPassword} className="auth-form" id="forgot-password-form">
            <div className="form-group">
              <label htmlFor="forgot-phone">Registered Mobile Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#2a2a2a', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#aaa', fontWeight: 600 }}>
                  +91
                </span>
                <input
                  id="forgot-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Send Verification Code via:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setOtpChannel('SMS')}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: otpChannel === 'SMS' ? 'var(--primary)' : 'var(--border-color)',
                    background: otpChannel === 'SMS' ? 'rgba(46, 125, 50, 0.25)' : '#2a2a2a',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.88rem'
                  }}
                >
                  📱 SMS Message
                </button>
                <button
                  type="button"
                  onClick={() => setOtpChannel('WHATSAPP')}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: otpChannel === 'WHATSAPP' ? '#25D366' : 'var(--border-color)',
                    background: otpChannel === 'WHATSAPP' ? 'rgba(37, 211, 102, 0.25)' : '#2a2a2a',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.88rem'
                  }}
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem' }}
                onClick={() => handleSendOtp('FORGOT_PASSWORD')}
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : `Send OTP via ${otpChannel}`}
              </button>
            </div>

            {otpSent && (
              <>
                <div style={{ background: '#1c2e1f', border: '1px solid #2e7d32', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#81c784', fontWeight: 600, marginBottom: '2px' }}>
                    <span>📲</span> Reset OTP Sent
                  </div>
                  <div style={{ color: '#ccc' }}>
                    A 6-digit reset code has been sent to <strong>+91 {phone}</strong> via {otpChannel}. Enter the code below to reset your password.
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reset-otp">Enter 6-digit OTP Code</label>
                  <input
                    id="reset-otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reset-new-password">New Password</label>
                  <input
                    id="reset-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                  />
                </div>

                <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? 'Updating Password...' : 'Reset Password & Save'}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => { setAuthMode('PASSWORD'); setOtpSent(false); }}
              style={{
                width: '100%',
                marginTop: '1rem',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                padding: '0.6rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ← Back to Login
            </button>
          </form>
        )}

        <p className="auth-switch" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
