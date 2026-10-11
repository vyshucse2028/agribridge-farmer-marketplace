import { Navigate, Outlet } from 'react-router-dom'

/**
 * ProtectedRoute – redirects unauthenticated users or
 * users without the required role to the login page.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their own dashboard
    const dashMap = { FARMER: '/farmer/dashboard', BUYER: '/buyer/dashboard', ADMIN: '/admin/dashboard' }
    return <Navigate to={dashMap[role] || '/'} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
