import useAuthStore from "@/store/auth.store"
import { Navigate, Outlet } from "react-router";

const PublicRoute = () => {
  // 1. get token from store
  const { token } = useAuthStore();

  //2. if toke → redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  //3. if no token → return children
  return <Outlet /> 
}

export default PublicRoute