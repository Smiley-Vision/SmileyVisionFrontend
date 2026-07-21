import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'

import { useAuthStore } from '@/modules/core/stores/auth'

export function requireDriver(_to: RouteLocationNormalized): RouteLocationRaw | void {
  const auth = useAuthStore()

  if (!auth.isDriver) {
    return { name: 'login' }
  }
}
