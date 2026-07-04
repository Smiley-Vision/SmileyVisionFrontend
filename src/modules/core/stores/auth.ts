import smileyApi from '@/modules/core/api/smileyvisionApi'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AuthUser } from '../interfaces/AuthUser'

interface LoginResponse {
  message: string
  data: {
    user: AuthUser
    token: string
  }
}

const TOKEN_STORAGE_KEY = 'token'
const USER_STORAGE_KEY = 'user'

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY))
  const user = ref<AuthUser | null>(readStoredUser())

  const isAuthenticated = computed(() => !!token.value)
  const roleId = computed(() => Number(user.value?.role_id ?? 0))
  const isAdmin = computed(() => roleId.value === 1)
  const isBuyer = computed(() => roleId.value === 2)
  const isDriver = computed(() => roleId.value === 3)

  function setSession(nextToken: string, nextUser: AuthUser) {
    token.value = nextToken
    user.value = nextUser

    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
  }

  function clearSession() {
    token.value = null
    user.value = null

    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  async function login(email: string, password: string) {
    const response = await smileyApi.post<LoginResponse>('/login', { email, password })
    setSession(response.data.data.token, response.data.data.user)
  }

  async function logout() {
    try {
      await smileyApi.post('/logout')
    } finally {
      clearSession()
    }
  }

  async function fetchMe() {
    const response = await smileyApi.get<{ data: AuthUser }>('/me')
    user.value = response.data.data
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.data))

    return response.data.data
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isBuyer,
    isDriver,
    login,
    logout,
    fetchMe,
    clearSession,
  }
})
