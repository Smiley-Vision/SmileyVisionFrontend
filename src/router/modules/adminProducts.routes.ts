import type { RouteRecordRaw } from 'vue-router'

const ManageProductsView = () => import('@/modules/admin-products/views/ManageProductsView.vue')
const CreateProductForm = () => import('@/modules/admin-products/views/CreateProductForm.vue')
const CreateLensBatchForm = () => import('@/modules/admin-products/views/CreateLensBatchForm.vue')
const AdminProductSearchView = () =>
  import('@/modules/admin-products/views/AdminProductSearchView.vue')
const ModifyProductForm = () => import('@/modules/admin-products/views/ModifyProductForm.vue')

export const adminProductsRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/products',
    name: 'admin-products',
    component: ManageProductsView,
  },
  {
    path: '/admin/products/create',
    name: 'admin-products-create',
    component: CreateProductForm,
  },
  {
    path: '/admin/products/create/lenses-batch',
    name: 'admin-products-create-lenses-batch',
    component: CreateLensBatchForm,
  },
  {
    path: '/admin/products/modify',
    name: 'admin-products-modify',
    component: AdminProductSearchView,
    props: {
      targetRouteName: 'admin-products-modify-form',
      title: 'Busque un producto para editar',
    },
  },
  {
    path: '/admin/products/modify/:id',
    name: 'admin-products-modify-form',
    component: ModifyProductForm,
  },
]
