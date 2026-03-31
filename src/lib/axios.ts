import axios from 'axios'
import useAuthStore from '@/store/auth.store'


const api = axios.create({
  baseURL: 'http://localhost:3000'
})

// request interceptor
api.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState()
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
  // if token exists, add to headers
  return config
})

// response interceptor  
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { logout } = useAuthStore.getState()
    // check if error is 401
    if (error.response && error.response.status === 401) { 
        logout();
    }
    // if yes, call logout
    return Promise.reject(error)
  }
)

export default api