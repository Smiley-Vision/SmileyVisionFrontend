import { useAuthStore } from '@/contexts/identity/stores/auth'

export function requireAdmin() {
    const auth = useAuthStore()

    if (!auth.isAdmin) {
        return { name: 'login' }
    }
}
