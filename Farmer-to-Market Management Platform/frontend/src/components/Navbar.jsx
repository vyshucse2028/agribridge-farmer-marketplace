import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import '../styles/Navbar.css'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const firstName = localStorage.getItem('firstName')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🌾</span>
          <span className="brand-name">AgriBridge</span>
        </Link>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" className={isActive('/')}>Home</Link></li>
          <li><Link to="/crops" className={isActive('/crops')}>Browse Crops</Link></li>

          {token && (
            <>
              {role === 'FARMER' && (
                <li><Link to="/farmer/add-crop" className={isActive('/farmer/add-crop')}>+ Add Crop</Link></li>
              )}
              {role === 'BUYER' && (
                <>
                  <li><Link to="/buyer/cart" className={isActive('/buyer/cart')}>🛒 Cart</Link></li>
                </>
              )}
              <li>
                <Link
                  to={role === 'FARMER' ? '/farmer/orders' : '/buyer/orders'}
                  className={isActive(role === 'FARMER' ? '/farmer/orders' : '/buyer/orders')}
                >
                  Orders
                </Link>
              </li>
              {(role === 'FARMER' || role === 'BUYER') && (
                <li>
                  <Link
                    to={role === 'FARMER' ? '/farmer/track' : '/buyer/track'}
                    className={isActive(role === 'FARMER' ? '/farmer/track' : '/buyer/track')}
                  >
                    🗺️ Track Map
                  </Link>
                </li>
              )}
              {role === 'ADMIN' && (
                <li><Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>Admin Panel</Link></li>
              )}
            </>
          )}
        </ul>

        <div className="navbar-actions">
          {token ? (
            <div className="user-menu">
              <span className="user-greeting">Hi, {firstName} 👋</span>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
