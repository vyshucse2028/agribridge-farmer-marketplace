import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cropAPI } from '../services/api'
import { toast } from 'react-toastify'
import { CROP_CATEGORIES } from '../data/indianCrops'

const AddCrop = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // If editing, crop data is passed via router state
  const editingCrop = location.state?.crop
  
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    categoryName: 'Vegetables',
    pricePerUnit: '',
    unit: 'kg',
    availableQuantity: '',
    available: true // In Stock tick mark
  })

  useEffect(() => {
    if (editingCrop) {
      setForm({
        name: editingCrop.name || '',
        categoryName: editingCrop.category?.name || 'Vegetables',
        pricePerUnit: editingCrop.pricePerUnit || '',
        unit: editingCrop.unit || 'kg',
        availableQuantity: editingCrop.availableQuantity || '',
        available: editingCrop.available !== undefined ? editingCrop.available : true
      })
    }
  }, [editingCrop])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.warning('Please enter the crop name')
    if (!form.pricePerUnit || Number(form.pricePerUnit) <= 0) return toast.warning('Please enter a valid price')
    if (!form.availableQuantity || Number(form.availableQuantity) <= 0) return toast.warning('Please enter available quantity')

    setLoading(true)
    
    try {
      const payload = {
        name: form.name.trim(),
        pricePerUnit: Number(form.pricePerUnit),
        unit: form.unit,
        availableQuantity: Number(form.availableQuantity),
        available: form.available
      }

      if (editingCrop) {
        await cropAPI.update(editingCrop.id, payload)
        toast.success('Crop updated successfully! 🌾')
      } else {
        await cropAPI.add(payload)
        toast.success('Crop listed successfully! 🌾')
      }
      navigate('/farmer/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save crop listing')
    } finally {
      setLoading(false)
    }
  }

  const categories = CROP_CATEGORIES.filter(c => c.id !== 'ALL')

  return (
    <div className="page-container form-page">
      <div className="auth-card register-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🌾</span>
          <h1>{editingCrop ? 'Edit Crop Listing' : 'Add Crop Listing'}</h1>
          <p>Directly list your farm produce for wholesale & retail mandi buyers</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="crop-form">
          {/* 1. Crop Name */}
          <div className="form-group">
            <label htmlFor="name">Crop / Produce Name *</label>
            <input 
              id="name" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="e.g. Sharbati Wheat, Toor Dal, Fresh Palak, Nashik Onion" 
              required 
              autoFocus
            />
          </div>

          {/* 2. Farming Category Selection */}
          <div className="form-group">
            <label htmlFor="categoryName">Agricultural Category *</label>
            <select 
              id="categoryName" 
              name="categoryName" 
              value={form.categoryName} 
              onChange={handleChange} 
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Price & Unit */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="pricePerUnit">Price (₹) *</label>
              <input 
                id="pricePerUnit" 
                type="number" 
                min="0.01" 
                step="0.01" 
                name="pricePerUnit" 
                value={form.pricePerUnit} 
                onChange={handleChange} 
                placeholder="₹ Price" 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="unit">Unit *</label>
              <select id="unit" name="unit" value={form.unit} onChange={handleChange} required>
                <option value="kg">kg (Kilogram)</option>
                <option value="quintal">quintal (100 kg)</option>
                <option value="tonne">tonne (1000 kg)</option>
                <option value="bunch">bunch (for leafy vegetables)</option>
                <option value="dozen">dozen</option>
                <option value="bag">bag</option>
              </select>
            </div>
          </div>

          {/* 4. Available Quantity */}
          <div className="form-group">
            <label htmlFor="availableQuantity">Available Harvest Quantity ({form.unit}) *</label>
            <input 
              id="availableQuantity" 
              type="number" 
              min="1" 
              name="availableQuantity" 
              value={form.availableQuantity} 
              onChange={handleChange} 
              placeholder="e.g. 100" 
              required 
            />
          </div>

          {/* 5. In Stock Tick Mark & Related Label Adjusted Perfectly Together */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '0.85rem 1rem', 
              background: 'var(--bg-card)', 
              borderRadius: '8px',
              border: `1.5px solid ${form.available ? 'var(--primary)' : 'var(--border-color)'}`,
              marginTop: '0.5rem',
              marginBottom: '1.5rem',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            onClick={() => setForm({ ...form, available: !form.available })}
          >
            <input 
              type="checkbox" 
              id="available" 
              name="available" 
              checked={form.available} 
              onChange={handleChange}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                width: '18px', 
                height: '18px', 
                accentColor: 'var(--primary)', 
                cursor: 'pointer',
                margin: 0,
                flexShrink: 0
              }}
            />
            <label 
              htmlFor="available" 
              style={{ 
                margin: 0, 
                fontWeight: 600, 
                color: 'var(--text-main)', 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                fontSize: '0.92rem'
              }}
            >
              <span>{form.available ? '✅ In Stock' : '❌ Out of Stock'}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                {form.available ? '(Available for buyers to order)' : '(Temporarily unavailable)'}
              </span>
            </label>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ flex: 1 }}
              onClick={() => navigate('/farmer/dashboard')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 2 }}
              disabled={loading}
              id="save-crop-btn"
            >
              {loading ? 'Saving...' : (editingCrop ? 'Update Crop' : '+ Add Crop Listing')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCrop
