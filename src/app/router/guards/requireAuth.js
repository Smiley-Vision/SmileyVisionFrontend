import { useAuthStore } from '@/contexts/identity/stores/auth'

export function requireAuth() {
    const auth = useAuthStore()

    if (!auth.isAuthenticated) {
        return { name: 'login' }
    }
}
