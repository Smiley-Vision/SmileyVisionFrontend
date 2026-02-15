import ManageProductAvailabilityView from '@/contexts/inventory/pages/ManageProductAvailabilityView.vue'
import ManageProductAvailabilityForm from '@/contexts/inventory/pages/ManageProductAvailabilityForm.vue'

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
