const ManageProductAvailabilityView = () =>
  import('@/modules/inventory/pages/ManageProductAvailabilityView.vue')
const ManageProductAvailabilityForm = () =>
  import('@/modules/inventory/pages/ManageProductAvailabilityForm.vue')

export const inventoryRoutes = [
  {
    path: '/admin/products/availability',
    name: 'admin-products-availability',
    component: ManageProductAvailabilityView,
  },
  {
    path: '/admin/products/availability/:code',
    name: 'admin-products-availability-form',
    component: ManageProductAvailabilityForm,
  },
]
