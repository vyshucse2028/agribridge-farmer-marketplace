import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import { toast } from 'react-toastify'
import '../styles/Dashboard.css'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')

  const firstName = localStorage.getItem('firstName')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [usersRes, ordersRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getOrders()
      ])
      setUsers(usersRes.data)
      setOrders(ordersRes.data)
    } catch (error) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleDisableUser = async (userId) => {
    if (window.confirm('Are you sure you want to disable this user?')) {
      try {
        await adminAPI.disableUser(userId)
        toast.success('User disabled successfully')
        fetchAdminData()
      } catch (error) {
        toast.error('Failed to disable user')
      }
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('WARNING: This will delete the user and all associated data. Continue?')) {
      try {
        await adminAPI.deleteUser(userId)
        toast.success('User deleted successfully')
        fetchAdminData()
      } catch (error) {
        toast.error('Failed to delete user')
      }
    }
  }

  if (loading) return <div className="loader">Loading admin dashboard...</div>

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Control Panel 🛡️</h1>
        <p>Manage platform users and monitor global orders.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-value">{users.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p className="stat-value">{orders.length}</p>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Platform Orders
        </button>
      </div>

      <div className="dashboard-section">
        {activeTab === 'users' && (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span></td>
                    <td>
                      <span className={`status-badge ${user.enabled ? 'status-active' : 'status-disabled'}`}>
                        {user.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      {user.role !== 'ADMIN' && (
                        <>
                          <button 
                            className="btn-sm btn-secondary" 
                            onClick={() => handleDisableUser(user.id)}
                            disabled={!user.enabled}
                          >
                            Disable
                          </button>
                          <button 
                            className="btn-sm btn-danger ml-2"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>₹{order.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
