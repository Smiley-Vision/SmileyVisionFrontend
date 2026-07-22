import type { RouteRecordRaw } from 'vue-router'

import { requireAuth } from '../guards/requireAuth'

const MyOrdersView = () => import('@/modules/orders/views/MyOrdersView.vue')
const OrderDetailView = () => import('@/modules/orders/views/OrderDetailView.vue')
const OrderConfirmationView = () => import('@/modules/orders/views/OrderConfirmationView.vue')

export const ordersRoutes: RouteRecordRaw[] = [
  {
    path: '/my-orders',
    name: 'my-orders',
    component: MyOrdersView,
    beforeEnter: requireAuth,
  },
  {
    path: '/orders/:id',
    name: 'order-detail',
    component: OrderDetailView,
    beforeEnter: requireAuth,
  },
  {
    path: '/orders/:id/confirmation',
    name: 'order-confirmation',
    component: OrderConfirmationView,
    beforeEnter: requireAuth,
  },
]
