import { useAuthStore } from '@/modules/identity/stores/auth'

export function requireAdmin() {
  const auth = useAuthStore()

  if (!auth.isAdmin) {
    return { name: 'login' }
  }
}
