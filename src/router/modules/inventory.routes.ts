import type { RouteRecordRaw } from 'vue-router'

const AdminProductSearchView = () =>
  import('@/modules/admin-products/views/AdminProductSearchView.vue')
const ManageProductAvailabilityForm = () =>
  import('@/modules/inventory/views/ManageProductAvailabilityForm.vue')

export const inventoryRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/products/availability',
    name: 'admin-products-availability',
    component: AdminProductSearchView,
    props: {
      targetRouteName: 'admin-products-availability-form',
      title: 'Busque un producto para disponibilidad',
    },
  },
  {
    path: '/admin/products/availability/:id',
    name: 'admin-products-availability-form',
    component: ManageProductAvailabilityForm,
  },
]
