import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppThemeLanguage, INDIAN_LANGUAGES } from '../context/ThemeLanguageContext'
import '../styles/Navbar.css'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { language, setLanguage, theme, toggleTheme, t } = useAppThemeLanguage()

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const firstName = localStorage.getItem('firstName')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
    setMenuOpen(false)
  }

  const closeMenu = () => setMenuOpen(false)

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' ? 'active' : ''
    return location.pathname === path || location.pathname.startsWith(`${path}/`) ? 'active' : ''
  }

  const dashPath = role === 'FARMER'
    ? '/farmer/dashboard'
    : role === 'BUYER'
    ? '/buyer/dashboard'
    : role === 'ADMIN'
    ? '/admin/dashboard'
    : '/'

  const buyerLinks = [
    { to: '/', label: t('home') },
    { to: '/categories', label: t('categories') },
    { to: '/crops', label: t('browseCrops') },
    { to: '/buyer/dashboard', label: t('dashboard') },
    { to: '/buyer/orders', label: t('orders') },
    { to: '/buyer/cart', label: t('cart') },
  ]

  const farmerLinks = [
    { to: '/', label: t('home') },
    { to: '/categories', label: t('categories') },
    { to: '/crops', label: t('browseCrops') },
    { to: '/farmer/dashboard', label: t('dashboard') },
    { to: '/farmer/orders', label: t('orders') },
  ]

  const guestLinks = [
    { to: '/', label: t('home') },
    { to: '/categories', label: t('categories') },
    { to: '/crops', label: t('browseCrops') },
  ]

  const pageLinks = !token
    ? guestLinks
    : role === 'BUYER'
    ? buyerLinks
    : role === 'FARMER'
    ? farmerLinks
    : [
        { to: '/', label: t('home') },
        { to: '/categories', label: t('categories') },
        { to: '/crops', label: t('browseCrops') },
        { to: '/admin/dashboard', label: t('admin') },
      ]

  const themeIcons = {
    dark: '🌙',
    light: '☀️'
  }

  const themeLabels = {
    dark: 'Dark',
    light: 'Light'
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">🌾</span>
          <span className="brand-name">AgriBridge</span>
        </Link>

        {/* Center / Page Navigation links */}
        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {pageLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className={isActive(link.to)} onClick={closeMenu}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Actions: Language Switcher, Theme Switcher & User Menu */}
        <div className="navbar-actions">
          {/* 🌐 All Indian Languages Switcher */}
          <div className="lang-switcher-container" style={{ position: 'relative' }}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: 'var(--input-bg)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.4rem 0.6rem',
                fontSize: '0.82rem',
                fontWeight: 650,
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '160px'
              }}
              aria-label="Change language across India"
              id="language-selector"
            >
              {INDIAN_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* 🎨 Theme Switcher Toggle (Dark / Light only) */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              background: 'var(--input-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            id="theme-toggle-btn"
          >
            <span>{themeIcons[theme]}</span>
            <span style={{ fontSize: '0.8rem' }}>{themeLabels[theme]}</span>
          </button>

          {token ? (
            <div className="user-menu">
              <Link to={dashPath} style={{ textDecoration: 'none' }}>
                <span className="user-greeting">Hi, {firstName} 👋</span>
              </Link>
              <button className="btn-logout" onClick={handleLogout} id="logout-btn">
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login" id="nav-login-btn">
                {t('login')}
              </Link>
              <Link to="/register" className="btn-register" id="nav-register-btn">
                {t('register')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  )
}

export default Navbar
