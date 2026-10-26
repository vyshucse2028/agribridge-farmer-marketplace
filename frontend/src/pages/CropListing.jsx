import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cropAPI } from '../services/api'
import CropCard from '../components/CropCard'
import { toast } from 'react-toastify'
import { ALL_INDIA_CROPS, CROP_CATEGORIES as DEFAULT_CATEGORIES, inferCategory } from '../data/indianCrops'
import { useAppThemeLanguage } from '../context/ThemeLanguageContext'

const CropListing = () => {
  const [searchParams] = useSearchParams()
  const { t } = useAppThemeLanguage()
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL')

  const role = localStorage.getItem('role')

  useEffect(() => {
    fetchCrops()
  }, [])

  useEffect(() => {
    const cat = searchParams.get('category')
    const q = searchParams.get('q')
    if (cat) setSelectedCategory(cat)
    if (q) setSearchTerm(q)
  }, [searchParams])

  const fetchCrops = async () => {
    try {
      setLoading(true)
      const res = await cropAPI.getAll()
      setCrops(res.data)
    } catch (error) {
      toast.error('Failed to load crops from market')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      return fetchCrops()
    }
    
    try {
      setLoading(true)
      const res = await cropAPI.search(searchTerm)
      setCrops(res.data)
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (crop) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = currentCart.find(item => item.id === crop.id)
    
    if (existingItem) {
      existingItem.cartQuantity += 1
    } else {
      currentCart.push({ ...crop, cartQuantity: 1 })
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart))
    toast.success(`${crop.name} added to cart! 🛒`)
  }

  // Combine API-listed farmer crops with our all-India produce items
  const getDisplayCrops = () => {
    const apiCrops = crops.map(crop => ({
      ...crop,
      category: crop.category || { name: inferCategory(crop) },
      isFromApi: true
    }))

    const apiCropNames = new Set(apiCrops.map(c => c.name?.toLowerCase()))
    const showcaseCrops = ALL_INDIA_CROPS
      .filter(c => !apiCropNames.has(c.name.toLowerCase()))
      .map((c, idx) => ({
        id: `showcase-${idx}`,
        name: c.name,
        category: { name: c.category },
        pricePerUnit: c.avgPrice,
        unit: 'kg',
        availableQuantity: 500,
        available: true,
        farmer: { user: { firstName: c.region.split(',')[0], lastName: 'Farmer' } },
        region: c.region,
        season: c.season,
        icon: c.icon,
        isShowcase: true
      }))

    return [...apiCrops, ...showcaseCrops]
  }

  const allDisplayCrops = getDisplayCrops()

  // Filter crops by search and category
  const filteredCrops = allDisplayCrops.filter(crop => {
    const category = crop.category?.name || inferCategory(crop)
    const matchesCategory = selectedCategory === 'ALL' || category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch = !searchTerm || (crop.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="page-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '2.3rem', marginBottom: '0.5rem' }}>
          🇮🇳 All-India Produce & Mandi Market
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '780px', margin: '0 auto', fontSize: '0.98rem' }}>
          Browse fresh harvest directly from verified Indian farmers across key agricultural categories: Cereals, Pulses, Fruits, Vegetables, Leafy Vegetables, Spices, and Oilseeds.
        </p>

        {/* Wholesale & Bulk Order Banner */}
        <div style={{ 
          marginTop: '1.25rem', 
          display: 'flex', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(46, 125, 50, 0.15)', 
            border: '1px solid rgba(46, 125, 50, 0.35)', 
            borderRadius: '20px', 
            padding: '7px 18px', 
            fontSize: '0.88rem', 
            color: '#81c784' 
          }}>
            <span>📦</span>
            <span><strong>Bulk & Commercial Mandi Sourcing:</strong> Direct truckloads & multi-quintal supply with zero broker commissions.</span>
          </div>

          {role === 'BUYER' && (
            <Link 
              to="/buyer/cart"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--primary)',
                color: 'white',
                padding: '7px 20px',
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '0.88rem',
                textDecoration: 'none'
              }}
            >
              📦 Go to Bulk Order / Cart →
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container" style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'center' }}>
        <form onSubmit={handleSearch} className="search-form" style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '650px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search crops (e.g. Sharbati Wheat, Toor Dal, Fresh Palak, Nashik Onion)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
            Search
          </button>
          {searchTerm && (
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => { setSearchTerm(''); fetchCrops(); }}
              style={{ padding: '0.75rem 1rem', borderRadius: '8px' }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Categories Filter Tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.7rem', fontWeight: 700, letterSpacing: '0.5px' }}>
          FILTER BY AGRICULTURAL CATEGORY:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {DEFAULT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase()

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '25px',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                  color: isSelected ? 'white' : 'var(--text-muted)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Crops Display Grid */}
      {loading ? (
        <div className="loader" style={{ textAlign: 'center', padding: '3rem' }}>
          Loading agricultural mandi market produce...
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '12px' }}>
          <h3>No crops found in this category</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try selecting "All Produce" or clear your search term.</p>
          <button 
            className="btn-secondary mt-3" 
            onClick={() => { setSelectedCategory('ALL'); setSearchTerm(''); fetchCrops(); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              Showing <strong style={{ color: 'var(--text-main)' }}>{filteredCrops.length}</strong> items in <strong>{selectedCategory === 'ALL' ? 'All Produce' : selectedCategory}</strong>
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--primary)' }}>
              ⚡ Real-time mandi rates
            </span>
          </div>
          <div className="crops-grid">
            {filteredCrops.map(crop => (
              <CropCard 
                key={crop.id} 
                crop={{
                  ...crop,
                  category: crop.category || { name: inferCategory(crop) }
                }} 
                onAddToCart={!crop.isShowcase ? handleAddToCart : undefined} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CropListing
