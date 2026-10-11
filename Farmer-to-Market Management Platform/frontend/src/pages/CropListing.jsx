import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cropAPI } from '../services/api'
import CropCard from '../components/CropCard'
import { toast } from 'react-toastify'

// Categories without numbering — clean labels only
const DEFAULT_CATEGORIES = [
  { id: 'ALL', name: 'All Produce', icon: '🌾' },
  { id: 'Vegetables', name: 'Vegetables (Sabzi Mandi)', icon: '🥬' },
  { id: 'Fruits', name: 'Fruits (Phal Mandi)', icon: '🍎' },
  { id: 'Grains & Cereals', name: 'Grains & Cereals (Anaj)', icon: '🌾' },
  { id: 'Pulses & Lentils', name: 'Pulses & Lentils (Dal)', icon: '🫘' },
  { id: 'Spices & Herbs', name: 'Spices & Herbs (Masale)', icon: '🌶️' },
  { id: 'Oilseeds & Cash Crops', name: 'Oilseeds & Cash Crops', icon: '🌻' },
]

// Comprehensive list of all major Indian vegetables and produce
const ALL_INDIA_CROPS = [
  // Vegetables
  { name: 'Tomato (Tamatar)', category: 'Vegetables', icon: '🍅', region: 'Nashik, Karnataka', avgPrice: 32 },
  { name: 'Onion (Pyaz)', category: 'Vegetables', icon: '🧅', region: 'Lasalgaon, Maharashtra', avgPrice: 38 },
  { name: 'Potato (Aloo)', category: 'Vegetables', icon: '🥔', region: 'Agra, UP', avgPrice: 22 },
  { name: 'Green Chilli (Hari Mirch)', category: 'Vegetables', icon: '🌶️', region: 'Andhra Pradesh', avgPrice: 45 },
  { name: 'Cauliflower (Phool Gobhi)', category: 'Vegetables', icon: '🥦', region: 'Punjab, Haryana', avgPrice: 28 },
  { name: 'Cabbage (Patta Gobhi)', category: 'Vegetables', icon: '🥬', region: 'Himachal, MP', avgPrice: 18 },
  { name: 'Spinach (Palak)', category: 'Vegetables', icon: '🥬', region: 'All India', avgPrice: 30 },
  { name: 'Brinjal / Eggplant (Baingan)', category: 'Vegetables', icon: '🍆', region: 'Karnataka, Gujarat', avgPrice: 25 },
  { name: 'Capsicum (Shimla Mirch)', category: 'Vegetables', icon: '🫑', region: 'Shimla, Bangalore', avgPrice: 55 },
  { name: 'Okra / Lady Finger (Bhindi)', category: 'Vegetables', icon: '🌿', region: 'Gujarat, MP', avgPrice: 35 },
  { name: 'Cucumber (Kheera)', category: 'Vegetables', icon: '🥒', region: 'All India', avgPrice: 20 },
  { name: 'Carrot (Gajar)', category: 'Vegetables', icon: '🥕', region: 'Punjab, UP', avgPrice: 28 },
  { name: 'Radish (Mooli)', category: 'Vegetables', icon: '🌿', region: 'Rajasthan, UP', avgPrice: 15 },
  { name: 'Bitter Gourd (Karela)', category: 'Vegetables', icon: '🌿', region: 'Andhra, Bihar', avgPrice: 40 },
  { name: 'Bottle Gourd (Lauki)', category: 'Vegetables', icon: '🌿', region: 'UP, Rajasthan', avgPrice: 18 },
  { name: 'Ridge Gourd (Turai)', category: 'Vegetables', icon: '🌿', region: 'Maharashtra, Gujarat', avgPrice: 22 },
  { name: 'Pumpkin (Kaddu)', category: 'Vegetables', icon: '🎃', region: 'All India', avgPrice: 15 },
  { name: 'Green Peas (Matar)', category: 'Vegetables', icon: '🫛', region: 'UP, MP', avgPrice: 65 },
  { name: 'French Beans (Sem)', category: 'Vegetables', icon: '🫘', region: 'Karnataka, Himachal', avgPrice: 48 },
  { name: 'Drumstick (Sahjan)', category: 'Vegetables', icon: '🌿', region: 'Tamil Nadu, AP', avgPrice: 42 },
  { name: 'Garlic (Lahsun)', category: 'Vegetables', icon: '🧄', region: 'Rajasthan, MP', avgPrice: 80 },
  { name: 'Ginger (Adrak)', category: 'Vegetables', icon: '🌿', region: 'Meghalaya, Kerala', avgPrice: 90 },
  { name: 'Sweet Potato (Shakarkandi)', category: 'Vegetables', icon: '🍠', region: 'UP, Odisha', avgPrice: 25 },
  { name: 'Beetroot (Chukandar)', category: 'Vegetables', icon: '🌿', region: 'Haryana, UP', avgPrice: 22 },
  { name: 'Turnip (Shalgam)', category: 'Vegetables', icon: '🌿', region: 'Punjab, Kashmir', avgPrice: 20 },
  { name: 'Mushroom (Khumbi)', category: 'Vegetables', icon: '🍄', region: 'HP, UP', avgPrice: 120 },
  { name: 'Fenugreek Leaves (Methi)', category: 'Vegetables', icon: '🌿', region: 'Rajasthan, Gujarat', avgPrice: 35 },
  { name: 'Coriander (Dhaniya)', category: 'Vegetables', icon: '🌿', region: 'All India', avgPrice: 40 },
  { name: 'Mint (Pudina)', category: 'Vegetables', icon: '🌿', region: 'UP, Rajasthan', avgPrice: 30 },
  { name: 'Curry Leaves (Kadi Patta)', category: 'Vegetables', icon: '🌿', region: 'South India', avgPrice: 45 },

  // Fruits
  { name: 'Mango (Aam)', category: 'Fruits', icon: '🥭', region: 'Ratnagiri, UP, AP', avgPrice: 80 },
  { name: 'Banana (Kela)', category: 'Fruits', icon: '🍌', region: 'Tamil Nadu, Maharashtra', avgPrice: 30 },
  { name: 'Apple (Seb)', category: 'Fruits', icon: '🍎', region: 'Kashmir, Himachal', avgPrice: 120 },
  { name: 'Orange (Santra)', category: 'Fruits', icon: '🍊', region: 'Nagpur, Coorg', avgPrice: 50 },
  { name: 'Pomegranate (Anar)', category: 'Fruits', icon: '🌿', region: 'Maharashtra, Rajasthan', avgPrice: 100 },
  { name: 'Grapes (Angoor)', category: 'Fruits', icon: '🍇', region: 'Nashik, Sangli', avgPrice: 60 },
  { name: 'Papaya (Papita)', category: 'Fruits', icon: '🌿', region: 'Gujarat, Karnataka', avgPrice: 25 },
  { name: 'Guava (Amrud)', category: 'Fruits', icon: '🌿', region: 'UP, MP', avgPrice: 40 },
  { name: 'Watermelon (Tarbooz)', category: 'Fruits', icon: '🍉', region: 'Rajasthan, Karnataka', avgPrice: 15 },
  { name: 'Lemon / Lime (Nimbu)', category: 'Fruits', icon: '🍋', region: 'Andhra, Gujarat', avgPrice: 55 },

  // Grains & Cereals
  { name: 'Basmati Rice (Chawal)', category: 'Grains & Cereals', icon: '🌾', region: 'Punjab, Haryana', avgPrice: 85 },
  { name: 'Wheat (Gehun)', category: 'Grains & Cereals', icon: '🌾', region: 'MP, UP, Punjab', avgPrice: 28 },
  { name: 'Maize / Corn (Makka)', category: 'Grains & Cereals', icon: '🌽', region: 'Bihar, Rajasthan', avgPrice: 22 },
  { name: 'Millet / Bajra', category: 'Grains & Cereals', icon: '🌾', region: 'Rajasthan, Gujarat', avgPrice: 25 },
  { name: 'Sorghum / Jowar', category: 'Grains & Cereals', icon: '🌾', region: 'Maharashtra, Karnataka', avgPrice: 30 },
  { name: 'Ragi / Finger Millet', category: 'Grains & Cereals', icon: '🌾', region: 'Karnataka, AP', avgPrice: 35 },

  // Pulses & Lentils
  { name: 'Chana Dal (Split Chickpea)', category: 'Pulses & Lentils', icon: '🫘', region: 'MP, Rajasthan', avgPrice: 65 },
  { name: 'Toor Dal (Arhar)', category: 'Pulses & Lentils', icon: '🫘', region: 'Maharashtra, Karnataka', avgPrice: 95 },
  { name: 'Moong Dal (Green Gram)', category: 'Pulses & Lentils', icon: '🫘', region: 'Rajasthan, MP', avgPrice: 85 },
  { name: 'Urad Dal (Black Gram)', category: 'Pulses & Lentils', icon: '🫘', region: 'AP, MP', avgPrice: 90 },
  { name: 'Masoor Dal (Red Lentil)', category: 'Pulses & Lentils', icon: '🫘', region: 'MP, UP', avgPrice: 75 },
  { name: 'Kabuli Chana (Chickpea)', category: 'Pulses & Lentils', icon: '🫘', region: 'MP, Rajasthan', avgPrice: 70 },

  // Spices & Herbs
  { name: 'Turmeric (Haldi)', category: 'Spices & Herbs', icon: '🌿', region: 'Erode, AP', avgPrice: 120 },
  { name: 'Red Chilli (Lal Mirch)', category: 'Spices & Herbs', icon: '🌶️', region: 'Guntur, Rajasthan', avgPrice: 140 },
  { name: 'Black Pepper (Kali Mirch)', category: 'Spices & Herbs', icon: '🌿', region: 'Kerala, Karnataka', avgPrice: 450 },
  { name: 'Cumin Seeds (Jeera)', category: 'Spices & Herbs', icon: '🌿', region: 'Rajasthan, Gujarat', avgPrice: 250 },
  { name: 'Cardamom (Elaichi)', category: 'Spices & Herbs', icon: '🌿', region: 'Kerala, TN', avgPrice: 1200 },
  { name: 'Cloves (Laung)', category: 'Spices & Herbs', icon: '🌿', region: 'Kerala, TN', avgPrice: 850 },

  // Oilseeds & Cash Crops
  { name: 'Mustard Seeds (Sarson)', category: 'Oilseeds & Cash Crops', icon: '🌻', region: 'Rajasthan, MP', avgPrice: 55 },
  { name: 'Groundnut (Moongphali)', category: 'Oilseeds & Cash Crops', icon: '🥜', region: 'Gujarat, AP', avgPrice: 65 },
  { name: 'Soybean', category: 'Oilseeds & Cash Crops', icon: '🌻', region: 'MP, Maharashtra', avgPrice: 48 },
  { name: 'Sunflower Seeds', category: 'Oilseeds & Cash Crops', icon: '🌻', region: 'Karnataka, AP', avgPrice: 60 },
  { name: 'Sesame (Til)', category: 'Oilseeds & Cash Crops', icon: '🌻', region: 'Rajasthan, Gujarat', avgPrice: 110 },
  { name: 'Cotton (Kapas)', category: 'Oilseeds & Cash Crops', icon: '🌻', region: 'Gujarat, Maharashtra', avgPrice: 62 },
]

// Helper to infer or categorize crops
const inferCategory = (crop) => {
  if (crop.category?.name) return crop.category.name
  const name = (crop.name || '').toLowerCase()
  if (name.includes('tomato') || name.includes('onion') || name.includes('potato') || name.includes('cucumber') || 
      name.includes('cabbage') || name.includes('carrot') || name.includes('spinach') || name.includes('capsicum') || 
      name.includes('okra') || name.includes('bhindi') || name.includes('peas') || name.includes('matar') || 
      name.includes('brinjal') || name.includes('eggplant') || name.includes('garlic') || name.includes('ginger') || 
      name.includes('cauliflower') || name.includes('vegetable') || name.includes('gobhi') || name.includes('palak') ||
      name.includes('gourd') || name.includes('lauki') || name.includes('karela') || name.includes('mooli') ||
      name.includes('drumstick') || name.includes('sahjan') || name.includes('methi') || name.includes('pudina') ||
      name.includes('coriander') || name.includes('dhaniya') || name.includes('mushroom') || name.includes('beetroot') ||
      name.includes('turnip') || name.includes('radish') || name.includes('mint') || name.includes('sweet potato')) {
    return 'Vegetables'
  }
  if (name.includes('mango') || name.includes('apple') || name.includes('orange') || name.includes('banana') || 
      name.includes('grape') || name.includes('pomegranate') || name.includes('anar') || name.includes('papaya') ||
      name.includes('guava') || name.includes('watermelon') || name.includes('lemon') || name.includes('lime')) {
    return 'Fruits'
  }
  if (name.includes('wheat') || name.includes('rice') || name.includes('paddy') || name.includes('barley') || 
      name.includes('millet') || name.includes('corn') || name.includes('maize') || name.includes('basmati') || 
      name.includes('sonamasuri') || name.includes('jowar') || name.includes('bajra') || name.includes('ragi')) {
    return 'Grains & Cereals'
  }
  if (name.includes('dal') || name.includes('pulse') || name.includes('moong') || name.includes('chana') || 
      name.includes('toor') || name.includes('urad') || name.includes('gram') || name.includes('masoor') ||
      name.includes('lentil') || name.includes('arhar')) {
    return 'Pulses & Lentils'
  }
  if (name.includes('chili') || name.includes('turmeric') || name.includes('pepper') || name.includes('coriander') || 
      name.includes('clove') || name.includes('cardamom') || name.includes('spice') || name.includes('haldi') ||
      name.includes('cumin') || name.includes('jeera')) {
    return 'Spices & Herbs'
  }
  if (name.includes('mustard') || name.includes('groundnut') || name.includes('peanut') || name.includes('cotton') || 
      name.includes('sunflower') || name.includes('sesame') || name.includes('sarson') || name.includes('soybean') ||
      name.includes('til')) {
    return 'Oilseeds & Cash Crops'
  }
  return 'Vegetables'
}

const CropListing = () => {
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const role = localStorage.getItem('role')

  useEffect(() => {
    fetchCrops()
  }, [])

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

  // Add all-India showcase crops that aren't already from the API
  const getDisplayCrops = () => {
    const apiCrops = crops.map(crop => ({
      ...crop,
      category: crop.category || { name: inferCategory(crop) },
      isFromApi: true
    }))

    // Combine API crops with showcase All-India crops (the showcase ones don't have IDs from DB)
    const apiCropNames = new Set(apiCrops.map(c => c.name?.toLowerCase()))
    const showcaseCrops = ALL_INDIA_CROPS
      .filter(c => !apiCropNames.has(c.name.toLowerCase()))
      .map((c, idx) => ({
        id: `showcase-${idx}`,
        name: c.name,
        category: { name: c.category },
        description: `Fresh ${c.name} sourced from ${c.region}. Direct from farms across India.`,
        pricePerUnit: c.avgPrice,
        unit: 'kg',
        availableQuantity: 500,
        available: true,
        farmer: { user: { firstName: c.region.split(',')[0], lastName: 'Farmer' } },
        isShowcase: true
      }))

    return [...apiCrops, ...showcaseCrops]
  }

  const allDisplayCrops = getDisplayCrops()

  // Filter crops by search and category
  const filteredCrops = allDisplayCrops.filter(crop => {
    const category = crop.category?.name || inferCategory(crop)
    const matchesCategory = selectedCategory === 'ALL' || category === selectedCategory
    const matchesSearch = !searchTerm || (crop.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="page-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
          🇮🇳 All-India Vegetable & Produce Mandi Market
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto' }}>
          Direct access to fresh market vegetables, fruits, grains, pulses, and spices harvested across major agricultural mandis of India.
        </p>

        {/* Wholesale & Bulk Order Banner */}
        <div style={{ 
          marginTop: '1rem', 
          display: 'flex', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '10px', 
            background: 'rgba(255, 183, 3, 0.1)', 
            border: '1px solid rgba(255, 183, 3, 0.3)', 
            borderRadius: '20px', 
            padding: '6px 18px', 
            fontSize: '0.86rem', 
            color: '#ffb703' 
          }}>
            <span>📦</span>
            <span><strong>Bulk Wholesale Orders Available:</strong> Direct truckloads & commercial supplies for wholesale traders, mandis & restaurants.</span>
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
                padding: '8px 20px',
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '0.88rem',
                textDecoration: 'none',
                transition: 'background 0.2s'
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
            placeholder="Search all-India crops (e.g. Nashik Onions, Shimla Capsicum, Basmati, Tomatoes)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary search-btn">Search</button>
          {searchTerm && (
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => { setSearchTerm(''); fetchCrops(); }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Categories Filter Tabs — No numbering, clean labels */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.65rem', fontWeight: 600, letterSpacing: '0.5px' }}>
          MARKET CATEGORIES:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {DEFAULT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id

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
                  fontWeight: isSelected ? 600 : 500,
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
          Loading all-India vegetable & produce market...
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '12px' }}>
          <h3>No crops found in this category</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try selecting "All Produce" or clear your search.</p>
          <button 
            className="btn-secondary mt-3" 
            onClick={() => { setSelectedCategory('ALL'); setSearchTerm(''); fetchCrops(); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Showing <strong style={{ color: 'white' }}>{filteredCrops.length}</strong> crops across all Indian mandis
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
