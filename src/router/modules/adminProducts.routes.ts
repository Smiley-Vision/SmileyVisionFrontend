import type { RouteRecordRaw } from 'vue-router'

const ManageProductsView = () => import('@/modules/admin-products/pages/ManageProductsView.vue')
const CreateProductForm = () => import('@/modules/admin-products/pages/CreateProductForm.vue')
const CreateLensBatchForm = () => import('@/modules/admin-products/pages/CreateLensBatchForm.vue')
const ModifyProductView = () => import('@/modules/admin-products/pages/ModifyProductView.vue')
const ModifyProductForm = () => import('@/modules/admin-products/pages/ModifyProductForm.vue')

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
    component: ModifyProductView,
  },
  {
    path: '/admin/products/modify/:code',
    name: 'admin-products-modify-form',
    component: ModifyProductForm,
  },
]
