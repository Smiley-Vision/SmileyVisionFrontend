import { useAuthStore } from '@/modules/identity/stores/auth'

export function requireAuth() {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return { name: 'login' }
  }
}
