import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CropListing from './pages/CropListing'
import AddCrop from './pages/AddCrop'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import TrackGoods from './pages/TrackGoods'

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/crops" element={<CropListing />} />

          {/* Farmer Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['FARMER']} />}>
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/add-crop" element={<AddCrop />} />
            <Route path="/farmer/orders" element={<Orders />} />
            <Route path="/farmer/track" element={<TrackGoods />} />
            <Route path="/farmer/profile" element={<Profile />} />
          </Route>

          {/* Buyer Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['BUYER']} />}>
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route path="/buyer/cart" element={<Cart />} />
            <Route path="/buyer/orders" element={<Orders />} />
            <Route path="/buyer/track" element={<TrackGoods />} />
            <Route path="/buyer/profile" element={<Profile />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
