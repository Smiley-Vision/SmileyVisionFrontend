import { createRouter, createWebHistory } from 'vue-router'

import { requireAuth } from './guards/requireAuth'
import { requireAdmin } from './guards/requireAdmin'

import { marketingRoutes } from './modules/marketing.routes'
import { identityRoutes } from './modules/identity.routes'
import { registrationRoutes } from './modules/registration.routes'
import { catalogRoutes } from './modules/catalog.routes'
import { adminProductsRoutes } from './modules/adminProducts.routes'
import { inventoryRoutes } from './modules/inventory.routes'

import NotFoundView from '@/contexts/marketing/pages/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...marketingRoutes,
    ...identityRoutes,
    ...registrationRoutes,
    ...catalogRoutes,
    ...adminProductsRoutes,
    ...inventoryRoutes,
    {
      path: '/:catchAll(.*)',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach((to) => {
  if (!to.name || !to.name.toString().startsWith('admin')) {
    return
  }

  return requireAuth(to) || requireAdmin(to)
})

export default router
