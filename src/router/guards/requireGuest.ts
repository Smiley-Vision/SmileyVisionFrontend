import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'

import { useAuthStore } from '@/modules/core/stores/auth'

export function requireGuest(_to: RouteLocationNormalized): RouteLocationRaw | void {
  const auth = useAuthStore()

  if (auth.isAuthenticated) {
    return { name: 'home' }
  }
}
