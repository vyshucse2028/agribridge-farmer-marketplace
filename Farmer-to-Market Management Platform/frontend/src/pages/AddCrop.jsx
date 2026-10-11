import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cropAPI } from '../services/api'
import { toast } from 'react-toastify'

const AddCrop = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // If editing, crop data is passed via router state
  const editingCrop = location.state?.crop
  
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    pricePerUnit: '',
    unit: 'kg',
    availableQuantity: '',
    available: true // In Stock tick mark
  })

  useEffect(() => {
    if (editingCrop) {
      setForm({
        name: editingCrop.name || '',
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

  return (
    <div className="page-container form-page">
      <div className="auth-card register-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="auth-header">
          <span style={{ fontSize: '2.5rem' }}>🌾</span>
          <h1>{editingCrop ? 'Edit Crop' : 'Add Crop Listing'}</h1>
          <p>List your harvest directly to market buyers</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="crop-form">
          {/* 1. Crop Name */}
          <div className="form-group">
            <label htmlFor="name">Crop Name *</label>
            <input 
              id="name" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="e.g. Organic Tomatoes, Sharbati Wheat, Green Moong" 
              required 
              autoFocus
            />
          </div>

          {/* 2. Price and 3. Units */}
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
                <option value="dozen">dozen</option>
                <option value="piece">piece</option>
                <option value="bag">bag</option>
              </select>
            </div>
          </div>

          {/* 4. Quantity */}
          <div className="form-group">
            <label htmlFor="availableQuantity">Quantity ({form.unit}) *</label>
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

          {/* 5. In Stock Tick Mark */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '1rem', 
              background: '#242424', 
              borderRadius: '8px',
              border: `1px solid ${form.available ? 'var(--primary)' : 'var(--border-color)'}`,
              marginTop: '0.5rem',
              marginBottom: '1.5rem',
              cursor: 'pointer'
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
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <div>
              <label htmlFor="available" style={{ margin: 0, fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                {form.available ? '✅ In Stock' : '❌ Out of Stock'}
              </label>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {form.available ? 'Buyers can see and place orders for this crop' : 'Marked as out of stock temporarily'}
              </div>
            </div>
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
              {loading ? 'Saving...' : (editingCrop ? 'Update Crop' : '+ Add Crop')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCrop
