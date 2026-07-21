import type { RouteRecordRaw } from 'vue-router'

const AdminOrdersView = () => import('@/modules/orders/views/AdminOrdersView.vue')
const AdminOrderDetailView = () => import('@/modules/orders/views/AdminOrderDetailView.vue')

export const adminOrdersRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: AdminOrdersView,
  },
  {
    path: '/admin/orders/:id',
    name: 'admin-orders-detail',
    component: AdminOrderDetailView,
  },
]
