import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ALL_INDIA_CROPS, CROP_CATEGORIES } from '../data/indianCrops'
import { useAppThemeLanguage } from '../context/ThemeLanguageContext'

const Categories = () => {
  const navigate = useNavigate()
  const { t } = useAppThemeLanguage()
  const [active, setActive] = useState('ALL')

  const groups = useMemo(() => {
    const cats = CROP_CATEGORIES.filter((c) => c.id !== 'ALL')
    return cats.map((cat) => ({
      ...cat,
      crops: ALL_INDIA_CROPS.filter((crop) => crop.category === cat.id),
    }))
  }, [])

  const visible = active === 'ALL' ? groups : groups.filter((g) => g.id === active)

  return (
    <div className="page-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.6rem' }}>
          🇮🇳 Agricultural Produce & Crop Categories
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '780px', margin: '0.5rem auto 0', fontSize: '1rem' }}>
          Browse major agricultural commodities produced across Indian mandis: Cereals, Pulses, Fresh Fruits, Vegetables, Leafy Vegetables, Spices, and Oilseeds.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
        {CROP_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={active === cat.id ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActive(cat.id)}
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.92rem',
              borderRadius: '25px',
              border: active === cat.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              fontWeight: active === cat.id ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {visible.map((group) => (
        <section key={group.id} style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', gap: '1rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{group.icon}</span>
              <span>{group.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500, background: 'rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: '12px' }}>
                {group.crops.length} items
              </span>
            </h2>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(`/crops?category=${encodeURIComponent(group.id)}`)}
              style={{ padding: '0.45rem 1.1rem', fontSize: '0.86rem', borderRadius: '8px' }}
            >
              Browse in Mandi Market →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1rem' }}>
            {group.crops.map((crop) => (
              <Link
                key={crop.name}
                to={`/crops?category=${encodeURIComponent(group.id)}&q=${encodeURIComponent(crop.name.split(' (')[0])}`}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '1.1rem',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s'
                }}
                className="category-crop-item"
              >
                <div>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{crop.icon}</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', lineHeight: '1.3' }}>
                    {crop.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    📍 {crop.region}
                  </div>
                  {crop.season && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem', fontWeight: 600 }}>
                      🌱 Season: {crop.season}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Mandi Avg:</span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--secondary)', fontWeight: 700 }}>
                    ₹{crop.avgPrice.toLocaleString('en-IN')}/kg
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default Categories
