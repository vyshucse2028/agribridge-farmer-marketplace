import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const AGRI_NEWS = [
  {
    id: 1,
    tag: 'Govt Policy',
    audience: 'both',
    title: 'MSP Support Continues for Kharif & Rabi Crops',
    date: 'Oct 2026',
    summary: 'Minimum Support Prices remain aligned to at least 50% return over cost of production for notified crops.',
    details: 'Paddy, pulses, and oilseeds continue to receive procurement support through FCI and NAFED-linked channels.',
    icon: '🌾'
  },
  {
    id: 2,
    tag: 'Market Pulse',
    audience: 'both',
    title: 'Direct Farm-to-Buyer Trade Lifts Farmer Realisations',
    date: 'Oct 2026',
    summary: 'Mandi-bypass platforms are helping farmers keep a larger share of the consumer rupee while buyers get fresher lots.',
    details: 'Transparent weighing and farm-gate pickup cut brokerage, wastage, and multiple handling charges.',
    icon: '📈'
  },
  {
    id: 3,
    tag: 'Weather & Sowing',
    audience: 'farmer',
    title: 'Reservoir Levels Favour Rabi Sowing Window',
    date: 'Oct 2026',
    summary: 'Soil moisture after monsoon surplus is supporting wheat, mustard, gram, and vegetable nursery work.',
    details: 'Advisories recommend certified seed, balanced basal fertilizer, and timely irrigation scheduling.',
    icon: '🌦️'
  },
  {
    id: 4,
    tag: 'Buyer Alert',
    audience: 'buyer',
    title: 'Peak Harvest Arrivals: Onions, Tomato & Leafy Greens',
    date: 'Oct 2026',
    summary: 'Wholesale arrivals are rising in major mandis, which typically eases retail prices for kitchen staples.',
    details: 'Buyers can lock bulk lots of onion, tomato, potato, and seasonal greens directly from listed farms.',
    icon: '🛒'
  },
  {
    id: 5,
    tag: 'Financial Support',
    audience: 'farmer',
    title: 'Kisan Credit Card Renewals Fast-Tracked Digitally',
    date: 'Oct 2026',
    summary: 'Banks are processing KCC renewals against digital land records for timely input purchase.',
    details: 'Prompt-repayment interest subvention remains available for eligible short-term crop loans.',
    icon: '💳'
  },
  {
    id: 6,
    tag: 'Quality & Safety',
    audience: 'buyer',
    title: 'Traceable Lots Help Buyers Verify Farm Origin',
    date: 'Oct 2026',
    summary: 'Direct listings now show farmer location, harvest notes, and category so buyers can source with confidence.',
    details: 'Restaurants and bulk buyers can filter vegetables, grains, spices, and plantation produce by region.',
    icon: '✅'
  }
]

const NewsGrid = () => (
  <section className="agri-news-section" style={{ marginBottom: '3rem' }}>
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.8rem', margin: 0 }}>📰 Farmer & Buyer Agriculture News</h2>
      <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
        Policy, weather, mandi arrivals, and sourcing updates for growers and buyers.
      </p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem' }}>
      {AGRI_NEWS.map((news) => (
        <article
          key={news.id}
          style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ background: 'rgba(46, 125, 50, 0.2)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                {news.tag}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>{news.date}</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: 'white' }}>
              {news.icon} {news.title}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#ccc', lineHeight: '1.5', marginBottom: '0.75rem' }}>
              {news.summary}
            </p>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid #333', paddingTop: '0.75rem' }}>
            💡 {news.details}
          </div>
        </article>
      ))}
    </div>
  </section>
)

const Home = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const firstName = localStorage.getItem('firstName')

  const [howWorksTab, setHowWorksTab] = useState(role === 'BUYER' ? 'BUYER' : 'FARMER')

  const getDashboardLink = () => {
    if (role === 'FARMER') return '/farmer/dashboard'
    if (role === 'BUYER') return '/buyer/dashboard'
    if (role === 'ADMIN') return '/admin/dashboard'
    return '/login'
  }

  // ==========================================
  // 1. LOGGED-IN VIEW (FARMER / BUYER HUB)
  // ==========================================
  if (token) {
    return (
      <div className="home-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Personalized Welcome Banner */}
        <section 
          style={{
            background: 'linear-gradient(135deg, #1b3820 0%, #122116 100%)',
            padding: '2.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(46, 125, 50, 0.4)',
            marginBottom: '2.5rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, color: '#81c784', marginBottom: '0.75rem' }}>
                {role === 'FARMER' ? '🧑‍🌾 Verified Farmer Portal' : '🛒 Verified Buyer Portal'}
              </div>
              <h1 style={{ fontSize: '2.4rem', margin: '0 0 0.5rem 0', color: 'white' }}>
                Welcome, {firstName}! 🌾
              </h1>
              <p style={{ color: '#c8e6c9', margin: 0, fontSize: '1.05rem', maxWidth: '600px' }}>
                {role === 'FARMER'
                  ? 'Access today’s agricultural market news, live mandi updates, and manage your crops.'
                  : 'Check out today’s fresh harvest arrivals, market prices, and buy directly from farmers.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <Link to={getDashboardLink()} className="btn-primary" style={{ padding: '0.75rem 1.4rem', fontWeight: 600 }}>
                📊 Open Dashboard
              </Link>
              {role === 'FARMER' ? (
                <Link to="/farmer/add-crop" className="btn-secondary" style={{ padding: '0.75rem 1.4rem', fontWeight: 600 }}>
                  + Add New Crop
                </Link>
              ) : (
                <Link to="/crops" className="btn-secondary" style={{ padding: '0.75rem 1.4rem', fontWeight: 600 }}>
                  🍎 Browse Marketplace
                </Link>
              )}
              <Link to={role === 'FARMER' ? '/farmer/profile' : '/buyer/profile'} style={{ background: '#222', color: 'white', padding: '0.75rem 1.2rem', borderRadius: '8px', border: '1px solid #444', textDecoration: 'none', fontWeight: 600 }}>
                ✏️ Edit Profile
              </Link>
            </div>
          </div>
        </section>

        <NewsGrid />

        {/* How AgriBridge Works Interactive Section */}
        <section style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2rem' }}>🤝</span>
            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>How AgriBridge Works</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Transparent, direct, and zero-commission connection between farmers and consumers.
            </p>

            {/* Toggle Role View */}
            <div style={{ display: 'inline-flex', background: '#222', padding: '4px', borderRadius: '10px', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setHowWorksTab('FARMER')}
                style={{
                  padding: '0.6rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: howWorksTab === 'FARMER' ? 'var(--primary)' : 'transparent',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🧑‍🌾 How It Works for Farmers
              </button>
              <button
                type="button"
                onClick={() => setHowWorksTab('BUYER')}
                style={{
                  padding: '0.6rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: howWorksTab === 'BUYER' ? 'var(--primary)' : 'transparent',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🛒 How It Works for Buyers
              </button>
            </div>
          </div>

          {/* Workflow Steps Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem' }}>
            {howWorksTab === 'FARMER' ? (
              [
                { step: '01', title: '1. List Your Produce', icon: '📝', desc: 'Specify crop name, unit price, quantity, and tick "In Stock". No complicated paperwork.' },
                { step: '02', title: '2. Direct Buyer Orders', icon: '🔔', desc: 'Receive instant notifications when buyers order directly from your farm.' },
                { step: '03', title: '3. Farm-Gate Dispatch', icon: '🚚', desc: 'Pack produce fresh at harvest. Logistics partner picks up directly from your farm location.' },
                { step: '04', title: '4. 100% Direct Payouts', icon: '💵', desc: 'Zero middlemen fees. Full transparent payment sent to your account upon confirmation.' }
              ].map(item => (
                <div key={item.step} style={{ background: '#252525', padding: '1.5rem', borderRadius: '12px', borderTop: '4px solid var(--primary)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'white' }}>{item.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.desc}</p>
                </div>
              ))
            ) : (
              [
                { step: '01', title: '1. Browse Categories', icon: '🔍', desc: 'Explore vegetables, grains, fruits, pulses, and spices straight from farmers.' },
                { step: '02', title: '2. Add to Cart & Order', icon: '🛒', desc: 'Check in-stock quantities and purchase directly with transparent market prices.' },
                { step: '03', title: '3. Farm Fresh Dispatch', icon: '📦', desc: 'The farmer packs the produce fresh from the soil, ensuring maximum nutrition.' },
                { step: '04', title: '4. Doorstep Delivery', icon: '🏡', desc: 'Track delivery straight from the grower to your doorstep with freshness guaranteed.' }
              ].map(item => (
                <div key={item.step} style={{ background: '#252525', padding: '1.5rem', borderRadius: '12px', borderTop: '4px solid var(--secondary)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'white' }}>{item.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.desc}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    )
  }

  // ==========================================
  // 2. PUBLIC VIEW (UNAUTHENTICATED VISITORS)
  // ==========================================
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🌾 Farm Fresh, Direct to You</div>
          <h1 className="hero-title">
            Bridging Farmers <br />
            <span className="gradient-text">to Markets</span>
          </h1>
          <p className="hero-subtitle">
            AgriBridge connects farmers directly with buyers with mobile authentication,
            eliminating middlemen and ensuring fair prices for fresh harvests.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-hero-primary" id="hero-get-started">
              Get Started Free
            </Link>
            <Link to="/crops" className="btn-hero-secondary" id="hero-browse-crops">
              Browse Crops
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Farmers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">2,000+</span>
              <span className="stat-label">Buyers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Orders</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <div className="floating-card card-1">🥦 Vegetables</div>
            <div className="floating-card card-2">🌾 Grains</div>
            <div className="floating-card card-3">🍎 Fruits</div>
            <div className="hero-circle"></div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <NewsGrid />
      </div>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How AgriBridge Works</h2>
        <div className="steps-grid">
          {[
            { icon: '🧑‍🌾', step: '01', title: 'Farmer Lists Produce', desc: 'Add crops with quantity, price and In Stock tick mark' },
            { icon: '🔍', step: '02', title: 'Buyer Searches', desc: 'Browse fresh produce categorized directly by farmers' },
            { icon: '🛒', step: '03', title: 'Place Order', desc: 'Add produce to cart and place orders securely' },
            { icon: '✅', step: '04', title: 'Farmer Confirms', desc: 'Farmer confirms and prepares fresh harvest' },
            { icon: '🚚', step: '05', title: 'Direct Delivery', desc: 'Track delivery straight from farm to doorstep' },
            { icon: '⭐', step: '06', title: 'Fair Compensation', desc: 'Guaranteed payouts directly to the farmer' },
          ].map((item) => (
            <div className="step-card" key={item.step}>
              <div className="step-icon">{item.icon}</div>
              <div className="step-number">{item.step}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role Cards */}
      <section className="role-section">
        <h2>Join AgriBridge Today</h2>
        <div className="role-cards">
          <div className="role-card farmer-card">
            <div className="role-icon">🌱</div>
            <h3>Farmers</h3>
            <ul>
              <li>✅ Register with Mobile Number (No email required)</li>
              <li>✅ List crops with price, unit, quantity & In-stock tick</li>
              <li>✅ Get 100% direct buyer payments without brokers</li>
            </ul>
            <Link to="/register" className="btn-role" id="register-farmer">
              Register as Farmer
            </Link>
          </div>
          <div className="role-card buyer-card">
            <div className="role-icon">🛒</div>
            <h3>Buyers</h3>
            <ul>
              <li>✅ Register with Mobile Number (No email required)</li>
              <li>✅ Browse fresh produce across categories</li>
              <li>✅ Enjoy farm-fresh direct deliveries</li>
            </ul>
            <Link to="/register" className="btn-role" id="register-buyer">
              Register as Buyer
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
