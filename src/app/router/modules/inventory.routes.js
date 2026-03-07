const ManageProductAvailabilityView = () => import('@/contexts/inventory/pages/ManageProductAvailabilityView.vue')
const ManageProductAvailabilityForm = () => import('@/contexts/inventory/pages/ManageProductAvailabilityForm.vue')

export const inventoryRoutes = [
    {
        path: '/admin/products/availability',
        name: 'admin-products-availability',
        component: ManageProductAvailabilityView
    },
    {
        path: '/admin/products/availability/:code',
        name: 'admin-products-availability-form',
        component: ManageProductAvailabilityForm
    }
]
