import axios from 'axios'

const BASE_URL = '/api'

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// JWT interceptor – attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ───────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  otpLogin: (data) => api.post('/auth/otp-login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
}

// ─── Categories ─────────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/categories'),
}


// ─── Crops ──────────────────────────────────────────
export const cropAPI = {
  getAll: () => api.get('/crops'),
  getById: (id) => api.get(`/crops/${id}`),
  search: (keyword) => api.get(`/crops/search?keyword=${keyword}`),
  getMyCrops: () => api.get('/crops/my-crops'),
  add: (data) => api.post('/crops/add', data),
  update: (id, data) => api.put(`/crops/update/${id}`, data),
  delete: (id) => api.delete(`/crops/delete/${id}`),
}

// ─── Orders ─────────────────────────────────────────
export const persistAuth = (data) => {
  const { token, role, firstName, lastName, userId, phone, farmerId, buyerId } = data
  if (token) localStorage.setItem('token', token)
  if (role) localStorage.setItem('role', role)
  localStorage.setItem('firstName', firstName || 'User')
  localStorage.setItem('lastName', lastName || '')
  if (userId != null) localStorage.setItem('userId', userId)
  if (phone) localStorage.setItem('phone', phone)
  if (farmerId != null) localStorage.setItem('farmerId', farmerId)
  if (buyerId != null) localStorage.setItem('buyerId', buyerId)
}

export const orderAPI = {
  place: (data) => api.post('/orders/place', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getMyFarmerOrders: () => api.get('/orders/farmer-orders'),
  getFarmerOrders: (farmerId) => api.get(`/orders/farmer-orders/${farmerId}`),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}

// ─── Farmer ─────────────────────────────────────────
export const farmerAPI = {
  getProfile: () => api.get('/farmer/profile'),
  updateProfile: (data) => api.put('/farmer/profile', data),
}

// ─── Buyer ──────────────────────────────────────────
export const buyerAPI = {
  getProfile: () => api.get('/buyer/profile'),
  updateProfile: (data) => api.put('/buyer/profile', data),
}

// ─── Admin ──────────────────────────────────────────
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  disableUser: (id) => api.put(`/admin/users/${id}/disable`),
  getOrders: () => api.get('/admin/orders'),
}

export default api
