import ManageProductsView from '@/contexts/admin-products/pages/ManageProductsView.vue'
import CreateProductForm from '@/contexts/admin-products/pages/CreateProductForm.vue'
import ModifyProductView from '@/contexts/admin-products/pages/ModifyProductView.vue'
import ModifyProductForm from '@/contexts/admin-products/pages/ModifyProductForm.vue'

export const adminProductsRoutes = [
    {
        path: '/admin/products',
        name: 'admin-products',
        component: ManageProductsView
    },
    {
        path: '/admin/products/create',
        name: 'admin-products-create',
        component: CreateProductForm
    },
    {
        path: '/admin/products/modify',
        name: 'admin-products-modify',
        component: ModifyProductView
    },
    {
        path: '/admin/products/modify/:code',
        name: 'admin-products-modify-form',
        component: ModifyProductForm
    }
]
