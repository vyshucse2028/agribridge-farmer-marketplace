import { useState, useEffect } from 'react'
import { farmerAPI, buyerAPI } from '../services/api'
import { toast } from 'react-toastify'

const Profile = () => {
  const role = localStorage.getItem('role')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      let res;
      if (role === 'FARMER') {
        res = await farmerAPI.getProfile()
      } else if (role === 'BUYER') {
        res = await buyerAPI.getProfile()
      }
      setForm(res?.data || {})
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (role === 'FARMER') {
        await farmerAPI.updateProfile(form)
      } else if (role === 'BUYER') {
        await buyerAPI.updateProfile(form)
      }
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loader">Loading profile...</div>

  return (
    <div className="page-container form-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h1>My Profile 👤</h1>
          <p>Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* User base info (Read-only as it requires different endpoint typically, but displaying for context) */}
          <div className="form-group">
            <label>Name</label>
            <input value={`${form.user?.firstName || ''} ${form.user?.lastName || ''}`} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input value={form.user?.phone || localStorage.getItem('phone') || 'Registered Mobile'} disabled className="input-disabled" />
          </div>

          {role === 'FARMER' && (
            <>
              <div className="form-group">
                <label htmlFor="farmName">Farm Name</label>
                <input id="farmName" name="farmName" value={form.farmName || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="farmLocation">Farm Location</label>
                <input id="farmLocation" name="farmLocation" value={form.farmLocation || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="farmSize">Farm Size (e.g., 5 Acres)</label>
                <input id="farmSize" name="farmSize" value={form.farmSize || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="description">About the Farm</label>
                <textarea id="description" name="description" value={form.description || ''} onChange={handleChange} rows="3" />
              </div>
            </>
          )}

          {role === 'BUYER' && (
            <>
              <div className="form-group">
                <label htmlFor="shippingAddress">Shipping Address</label>
                <input id="shippingAddress" name="shippingAddress" value={form.shippingAddress || ''} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" value={form.city || ''} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="pincode">Pincode</label>
                  <input id="pincode" name="pincode" value={form.pincode || ''} onChange={handleChange} required />
                </div>
              </div>
            </>
          )}

          <div className="form-actions mt-4">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
