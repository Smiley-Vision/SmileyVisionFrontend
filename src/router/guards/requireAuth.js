import { useAuthStore } from '@/modules/core/stores/auth'

export function requireAuth() {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return { name: 'login' }
  }
}
