import type { RouteRecordRaw } from 'vue-router'

import { requireDriver } from '../guards/requireDriver'

const DriverOrdersView = () => import('@/modules/orders/views/DriverOrdersView.vue')

export const driverOrdersRoutes: RouteRecordRaw[] = [
  {
    path: '/driver/orders',
    name: 'driver-orders',
    component: DriverOrdersView,
    beforeEnter: requireDriver,
  },
]
