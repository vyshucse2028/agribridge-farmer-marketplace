import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="brand-icon">🌾</span>
          <span className="brand-name">AgriBridge</span>
          <p className="footer-tagline">Connecting Farmers to Markets</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/crops">Browse Crops</Link></li>
              <li><Link to="/register">Join as Farmer</Link></li>
              <li><Link to="/register">Join as Buyer</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} AgriBridge. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
