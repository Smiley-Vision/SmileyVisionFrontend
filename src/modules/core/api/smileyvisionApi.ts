import { useAuthStore } from '@/modules/core/stores/auth'
import axios from 'axios'
import { toApiProblem } from './apiProblem'

const smileyApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

smileyApi.interceptors.request.use(function onFulfilled(config) {
  const auth = useAuthStore()

  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }

  return config
})

smileyApi.interceptors.response.use(
  // The response status code is 2xx
  function onFulfilled(response) {
    return response
  },

  function onRejected(error) {
    const problem = toApiProblem(error)

    if (problem.status === 401) {
      useAuthStore().clearSession()
    }

    return Promise.reject(problem)
  },
)

export default smileyApi
