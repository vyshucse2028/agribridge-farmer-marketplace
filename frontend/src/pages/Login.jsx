import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI, persistAuth } from '../services/api'
import { toast } from 'react-toastify'
import { useAppThemeLanguage } from '../context/ThemeLanguageContext'

const Login = () => {
  const navigate = useNavigate()
  const { t } = useAppThemeLanguage()
  
  // Auth modes: 'PASSWORD' | 'OTP' | 'FORGOT'
  const [authMode, setAuthMode] = useState('PASSWORD')
  const [userRole, setUserRole] = useState('FARMER') // Farmer / Buyer
  const [otpChannel, setOtpChannel] = useState('SMS') // 'SMS' or 'WHATSAPP'
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [receivedOtp, setReceivedOtp] = useState('')

  // Password visibility eye toggles
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form states (strictly mobile numbers, NO email)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Simulated on-screen phone notification banner
  const [phoneNotification, setPhoneNotification] = useState(null)

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      return toast.warning('Please enter your 10-digit registered mobile number')
    }
    if (!password.trim()) {
      return toast.warning('Please enter your password')
    }

    setLoading(true)
    try {
      const res = await authAPI.login({
        phone: cleanPhone,
        password: password.trim()
      })
      handleLoginSuccess(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please verify your mobile number and password.')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (kind) => {
    setLoading(true)
    try {
      const creds = kind === 'FARMER'
        ? { phone: '9876543210', password: 'Farmer@123' }
        : { phone: '9876543211', password: 'Buyer@123' }
      const res = await authAPI.login(creds)
      handleLoginSuccess(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Quick login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (purpose = 'LOGIN') => {
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      return toast.warning('Please enter a valid 10-digit mobile number')
    }

    setLoading(true)
    try {
      const res = await authAPI.sendOtp({
        phone: cleanPhone,
        channel: otpChannel,
        type: purpose
      })
      const code = res.data.otp || String(Math.floor(100000 + Math.random() * 900000))
      setReceivedOtp(code)
      setOtpSent(true)
      setOtp('')

      // Trigger incoming phone message alert
      setPhoneNotification({
        phone: cleanPhone,
        code,
        channel: otpChannel,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      })

      toast.success(`OTP code dispatched to +91 ${cleanPhone} via ${otpChannel}! 📲`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please check the mobile number.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpLogin = async (e) => {
    e.preventDefault()
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 10) return toast.warning('Please enter your 10-digit mobile number')
    if (!otp.trim()) return toast.warning('Please enter the 6-digit OTP code')

    setLoading(true)
    try {
      const res = await authAPI.otpLogin({
        phone: cleanPhone,
        otp: otp.trim(),
        channel: otpChannel,
        role: userRole
      })
      handleLoginSuccess(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP code. Please enter the OTP sent to your phone.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 10) return toast.warning('Please enter your 10-digit mobile number')
    if (!otp.trim()) return toast.warning('Please enter the 6-digit OTP received via ' + otpChannel)
    if (!newPassword || newPassword.length < 6) {
      return toast.warning('New password must be at least 6 characters long')
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      return toast.warning('New password and confirm password do not match')
    }

    setLoading(true)
    try {
      const res = await authAPI.forgotPassword({
        phone: cleanPhone,
        otp: otp.trim(),
        newPassword: newPassword,
        channel: otpChannel
      })
      toast.success(res.data.message || 'Password reset successfully! Please login with your new password.')
      setAuthMode('PASSWORD')
      setPassword('')
      setOtp('')
      setOtpSent(false)
      setPhoneNotification(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed. Please verify the OTP code.')
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSuccess = (data) => {
    persistAuth(data)
    toast.success(`Welcome back, ${data.firstName || 'User'}! 🌾`)
    const dashMap = { FARMER: '/farmer/dashboard', BUYER: '/buyer/dashboard', ADMIN: '/admin/dashboard' }
    navigate(dashMap[data.role] || '/')
  }

  const autoFillOtp = () => {
    if (receivedOtp) {
      setOtp(receivedOtp)
      toast.info('OTP code auto-filled from phone message! ⚡')
    }
  }

  return (
    <div className="auth-page" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      
      {/* ─── REALISTIC INCOMING PHONE NOTIFICATION BANNER ─────────────────── */}
      {phoneNotification && (
        <div style={{
          maxWidth: '480px',
          width: '100%',
          background: 'linear-gradient(135deg, #0f2e1b 0%, #173822 100%)',
          border: '2px solid #22c55e',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          boxShadow: '0 10px 30px rgba(34, 197, 94, 0.35)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>
                {phoneNotification.channel === 'WHATSAPP' ? '💬' : '📱'}
              </span>
              <div>
                <strong style={{ color: 'white', fontSize: '0.9rem' }}>
                  {phoneNotification.channel === 'WHATSAPP' ? 'WhatsApp Message' : 'SMS Message'}
                </strong>
                <span style={{ color: '#86efac', fontSize: '0.74rem', marginLeft: '6px' }}>
                  To: +91 {phoneNotification.phone}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPhoneNotification(null)}
              style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.1rem', padding: 0 }}
            >
              ✕
            </button>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            Your AgriBridge verification code is: <strong style={{ color: '#4ade80', fontSize: '1.2rem', letterSpacing: '2px', fontFamily: 'monospace' }}>{phoneNotification.code}</strong>. Valid for 10 minutes. Do not share with anyone.
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={autoFillOtp}
              style={{
                flex: 1,
                background: '#16a34a',
                color: 'white',
                border: 'none',
                padding: '0.45rem 0.8rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              ⚡ Auto-Fill OTP ({phoneNotification.code})
            </button>
            {phoneNotification.channel === 'WHATSAPP' ? (
              <a
                href={`https://wa.me/91${phoneNotification.phone}?text=AgriBridge%20OTP%20Code:%20${phoneNotification.code}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#25D366',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📲 Open in WhatsApp
              </a>
            ) : (
              <a
                href={`sms:+91${phoneNotification.phone}?body=AgriBridge%20OTP:%20${phoneNotification.code}`}
                style={{
                  background: '#0284c7',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📱 Open SMS
              </a>
            )}
          </div>
        </div>
      )}

      {/* ─── AUTH CARD ─────────────────────────────────────────────────── */}
      <div className="auth-card" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
        
        {/* Role Switcher */}
        <div className="role-selector" style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`role-btn ${userRole === 'FARMER' ? 'selected' : ''}`}
            onClick={() => setUserRole('FARMER')}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '8px',
              border: 'none',
              background: userRole === 'FARMER' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
            id="login-tab-farmer"
          >
            🧑‍🌾 Farmer Portal
          </button>
          <button
            type="button"
            className={`role-btn ${userRole === 'BUYER' ? 'selected' : ''}`}
            onClick={() => setUserRole('BUYER')}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '8px',
              border: 'none',
              background: userRole === 'BUYER' ? '#1565c0' : 'rgba(255,255,255,0.05)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
            id="login-tab-buyer"
          >
            🛒 Buyer Portal
          </button>
        </div>

        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.3rem' }}>
            {authMode === 'FORGOT' ? '🔒' : userRole === 'FARMER' ? '🧑‍🌾' : '🛒'}
          </span>
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.4rem 0' }}>
            {authMode === 'FORGOT'
              ? 'Forgot Password'
              : `${userRole === 'FARMER' ? 'Farmer' : 'Buyer'} Login`}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            {authMode === 'FORGOT' 
              ? 'Reset your password via SMS or WhatsApp OTP directly to your phone'
              : `Access your account with your 10-digit mobile number`}
          </p>
        </div>

        {/* 3 Main Auth Modes: Password, Mobile OTP, Forgot Password */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.25)', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            onClick={() => { setAuthMode('PASSWORD'); setOtpSent(false); }}
            style={{
              padding: '0.55rem 0.3rem',
              border: 'none',
              borderRadius: '6px',
              background: authMode === 'PASSWORD' ? 'var(--primary)' : 'transparent',
              color: 'white',
              fontWeight: 650,
              fontSize: '0.78rem',
              cursor: 'pointer',
              textAlign: 'center'
            }}
            id="tab-password-login"
          >
            🔑 Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('OTP'); setOtpSent(false); }}
            style={{
              padding: '0.55rem 0.3rem',
              border: 'none',
              borderRadius: '6px',
              background: authMode === 'OTP' ? 'var(--primary)' : 'transparent',
              color: 'white',
              fontWeight: 650,
              fontSize: '0.78rem',
              cursor: 'pointer',
              textAlign: 'center'
            }}
            id="tab-otp-login"
          >
            ⚡ Mobile OTP
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('FORGOT'); setOtpSent(false); setOtp(''); }}
            style={{
              padding: '0.55rem 0.3rem',
              border: 'none',
              borderRadius: '6px',
              background: authMode === 'FORGOT' ? '#ea580c' : 'transparent',
              color: 'white',
              fontWeight: 650,
              fontSize: '0.78rem',
              cursor: 'pointer',
              textAlign: 'center'
            }}
            id="tab-forgot-login"
          >
            🔒 Forgot Pass
          </button>
        </div>

        {/* ─── 1. PASSWORD LOGIN FORM (WITH EYE BUTTON TO CHECK PASSWORD) ─── */}
        {authMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="auth-form" id="login-form">
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label htmlFor="login-phone" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Mobile Number *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'rgba(255,255,255,0.06)', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>
                  +91
                </span>
                <input
                  id="login-phone"
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  required
                  autoFocus
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {/* Password input with EYE OPTION */}
            <div className="form-group" style={{ marginBottom: '1.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="login-password" style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => { setAuthMode('FORGOT'); setOtpSent(false); setOtp(''); }}
                  style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.82rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                  id="forgot-password-link"
                >
                  Forgot Password?
                </button>
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ width: '100%', padding: '0.75rem 2.8rem 0.75rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1.15rem',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-auth-submit" 
              disabled={loading} 
              id="login-submit"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: userRole === 'FARMER' ? 'var(--primary)' : '#1565c0',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Logging in...' : `Login as ${userRole === 'FARMER' ? 'Farmer' : 'Buyer'}`}
            </button>

            {/* Instant 1-Click Fast Login */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(46, 125, 50, 0.12)', borderRadius: '10px', border: '1px solid rgba(46, 125, 50, 0.3)' }}>
              <div style={{ fontSize: '0.84rem', color: '#81c784', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚡</span> Instant 1-Click Demo Login
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <button 
                  type="button" 
                  disabled={loading}
                  onClick={() => quickLogin('FARMER')} 
                  style={{ 
                    flex: 1, 
                    padding: '0.55rem 0.8rem', 
                    borderRadius: '8px', 
                    border: 'none', 
                    background: '#2e7d32', 
                    color: 'white', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    fontWeight: 700, 
                    fontSize: '0.85rem'
                  }}
                  id="quick-farmer-login"
                >
                  🧑‍🌾 1-Click Farmer
                </button>
                <button 
                  type="button" 
                  disabled={loading}
                  onClick={() => quickLogin('BUYER')} 
                  style={{ 
                    flex: 1, 
                    padding: '0.55rem 0.8rem', 
                    borderRadius: '8px', 
                    border: 'none', 
                    background: '#1565c0', 
                    color: 'white', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    fontWeight: 700, 
                    fontSize: '0.85rem'
                  }}
                  id="quick-buyer-login"
                >
                  🛒 1-Click Buyer
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
                <span>Farmer: 9876543210</span>
                <span>Buyer: 9876543211</span>
              </div>
            </div>
          </form>
        )}

        {/* ─── 2. OTP LOGIN FORM (SMS or WhatsApp directly to phone) ──────── */}
        {authMode === 'OTP' && (
          <form onSubmit={handleOtpLogin} className="auth-form" id="otp-login-form">
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label htmlFor="otp-phone" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Mobile Number *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'rgba(255,255,255,0.06)', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>
                  +91
                </span>
                <input
                  id="otp-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  required
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {/* Delivery Channel: SMS or WhatsApp */}
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                Send OTP Directly to Phone via:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setOtpChannel('SMS')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: otpChannel === 'SMS' ? 'var(--primary)' : 'var(--border-color)',
                    background: otpChannel === 'SMS' ? 'rgba(46, 125, 50, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 650
                  }}
                >
                  📱 SMS Message
                </button>
                <button
                  type="button"
                  onClick={() => setOtpChannel('WHATSAPP')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: otpChannel === 'WHATSAPP' ? '#25D366' : 'var(--border-color)',
                    background: otpChannel === 'WHATSAPP' ? 'rgba(37, 211, 102, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 650
                  }}
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', padding: '0.7rem', fontSize: '0.9rem', borderRadius: '8px' }}
                onClick={() => handleSendOtp('LOGIN')}
                disabled={loading}
                id="send-otp-btn"
              >
                {loading ? 'Sending OTP...' : (otpSent ? `Resend OTP via ${otpChannel} to Phone` : `Send OTP to Phone via ${otpChannel}`)}
              </button>
            </div>

            {otpSent && (
              <>
                <div style={{ background: 'rgba(46, 125, 50, 0.15)', border: '1px solid rgba(46, 125, 50, 0.4)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#81c784', fontWeight: 700, marginBottom: '3px' }}>
                    <span>📲</span> OTP Sent to +91 {phone}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Check your phone notification bar or WhatsApp message above for the 6-digit code.
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                  <label htmlFor="otp-input" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    Enter 6-digit OTP Code *
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '1.1rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 700 }}
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn-auth-submit" 
              disabled={loading || !otpSent} 
              id="verify-otp-submit"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: (loading || !otpSent) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Verifying...' : 'Verify OTP & Login'}
            </button>
          </form>
        )}

        {/* ─── 3. FORGOT PASSWORD FORM (WITH EYE BUTTONS) ───────────────── */}
        {authMode === 'FORGOT' && (
          <form onSubmit={handleResetPassword} className="auth-form" id="forgot-password-form">
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label htmlFor="forgot-phone" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Registered Mobile Number *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'rgba(255,255,255,0.06)', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>
                  +91
                </span>
                <input
                  id="forgot-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  required
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {/* Delivery Channel: SMS or WhatsApp */}
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                Send Reset Code Directly to Phone via:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setOtpChannel('SMS')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: otpChannel === 'SMS' ? '#ea580c' : 'var(--border-color)',
                    background: otpChannel === 'SMS' ? 'rgba(234, 88, 12, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 650
                  }}
                >
                  📱 SMS Message
                </button>
                <button
                  type="button"
                  onClick={() => setOtpChannel('WHATSAPP')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: otpChannel === 'WHATSAPP' ? '#25D366' : 'var(--border-color)',
                    background: otpChannel === 'WHATSAPP' ? 'rgba(37, 211, 102, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 650
                  }}
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', padding: '0.7rem', fontSize: '0.9rem', borderRadius: '8px' }}
                onClick={() => handleSendOtp('FORGOT_PASSWORD')}
                disabled={loading}
                id="send-forgot-otp-btn"
              >
                {loading ? 'Sending to Phone...' : (otpSent ? `Resend Code via ${otpChannel}` : `Send Code to Phone via ${otpChannel}`)}
              </button>
            </div>

            {otpSent && (
              <>
                <div style={{ background: 'rgba(234, 88, 12, 0.15)', border: '1px solid rgba(234, 88, 12, 0.4)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fb923c', fontWeight: 700, marginBottom: '3px' }}>
                    <span>📲</span> Reset Code Dispatched to Phone
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Check your phone notification above. Click Auto-Fill or type the 6-digit code.
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label htmlFor="reset-otp" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    Enter 6-digit OTP Code *
                  </label>
                  <input
                    id="reset-otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '1.1rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 700 }}
                  />
                </div>

                {/* New Password with Eye Button */}
                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label htmlFor="reset-new-password" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    New Password (Min 6 characters) *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      id="reset-new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                      style={{ width: '100%', padding: '0.75rem 2.8rem 0.75rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '1.15rem',
                        padding: '4px'
                      }}
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password with Eye Button */}
                <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                  <label htmlFor="reset-confirm-password" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    Confirm New Password *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                      style={{ width: '100%', padding: '0.75rem 2.8rem 0.75rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '1.15rem',
                        padding: '4px'
                      }}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-auth-submit" 
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ea580c',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
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
                padding: '0.65rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem'
              }}
            >
              ← Back to Password Login
            </button>
          </form>
        )}

        <p className="auth-switch" style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Register with Mobile
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
