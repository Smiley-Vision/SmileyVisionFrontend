import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'

import { useAuthStore } from '@/modules/core/stores/auth'

export function requireAdmin(_to: RouteLocationNormalized): RouteLocationRaw | void {
  const auth = useAuthStore()

  if (!auth.isAdmin) {
    return { name: 'login' }
  }
}
