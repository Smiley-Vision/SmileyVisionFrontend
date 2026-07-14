import type { RouteRecordRaw } from 'vue-router'

const ProductsView = () => import('@/modules/catalog/views/ProductsView.vue')
const ProductView = () => import('@/modules/catalog/views/ProductView.vue')

export const catalogRoutes: RouteRecordRaw[] = [
  {
    path: '/shop/:categorySlug?',
    name: 'shop',
    component: ProductsView,
  },
  {
    path: '/shop/products/:code',
    name: 'product',
    component: ProductView,
  },
]
