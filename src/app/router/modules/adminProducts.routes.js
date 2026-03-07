const ManageProductsView = () => import('@/contexts/admin-products/pages/ManageProductsView.vue')
const CreateProductForm = () => import('@/contexts/admin-products/pages/CreateProductForm.vue')
const ModifyProductView = () => import('@/contexts/admin-products/pages/ModifyProductView.vue')
const ModifyProductForm = () => import('@/contexts/admin-products/pages/ModifyProductForm.vue')

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
