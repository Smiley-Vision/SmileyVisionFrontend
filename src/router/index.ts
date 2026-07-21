import { createRouter, createWebHistory } from 'vue-router'

import NotFoundView from '@/modules/marketing/pages/NotFoundView.vue'

import { requireAdmin } from './guards/requireAdmin'
import { requireAuth } from './guards/requireAuth'
import { requireGuest } from './guards/requireGuest'
import { adminOrdersRoutes } from './modules/adminOrders.routes'
import { adminProductsRoutes } from './modules/adminProducts.routes'
import { catalogRoutes } from './modules/catalog.routes'
import { driverOrdersRoutes } from './modules/driverOrders.routes'
import { identityRoutes } from './modules/identity.routes'
import { inventoryRoutes } from './modules/inventory.routes'
import { marketingRoutes } from './modules/marketing.routes'
import { ordersRoutes } from './modules/orders.routes'
import { registrationRoutes } from './modules/registration.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...marketingRoutes,
    ...identityRoutes,
    ...registrationRoutes,
    ...catalogRoutes,
    ...adminProductsRoutes,
    ...adminOrdersRoutes,
    ...inventoryRoutes,
    ...ordersRoutes,
    ...driverOrdersRoutes,
    {
      path: '/:catchAll(.*)',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requireGuest) {
    return requireGuest(to)
  }

  if (!to.name || !to.name.toString().startsWith('admin')) {
    return
  }

  return requireAuth(to) || requireAdmin(to)
})

export default router
