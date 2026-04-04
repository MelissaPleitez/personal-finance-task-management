import useAuthStore from '@/store/auth.store'
import { Navigate, Outlet } from 'react-router-dom'


const ProtectedRoute = () => {
  // 1. get token from store
    const { token } = useAuthStore()
  // 2. if no token → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />
  }
  // 3. if token → return children
  return <Outlet />
}

export default ProtectedRoute