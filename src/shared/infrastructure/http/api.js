import axios from 'axios'
import { useAuthStore } from '@/contexts/identity/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  config.headers = config.headers ?? {}

  if (auth.isAuthenticated) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data ?? error),
)

export { api }
