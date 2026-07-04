import { useAuthStore } from '@/modules/core/stores/auth'

export function requireAdmin() {
  const auth = useAuthStore()

  if (!auth.isAdmin) {
    return { name: 'login' }
  }
}
