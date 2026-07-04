import type { RouteRecordRaw } from 'vue-router'

import { requireAuth } from '../guards/requireAuth'

const ShopView = () => import('@/modules/catalog/pages/ShopView.vue')
const MicasView = () => import('@/modules/catalog/pages/MicasView.vue')
const SearchMicasView = () => import('@/modules/catalog/pages/SearchMicasView.vue')
const ArmazonesView = () => import('@/modules/catalog/pages/ArmazonesView.vue')
const SearchArmazonesView = () => import('@/modules/catalog/pages/SearchArmazonesView.vue')
const EquiposView = () => import('@/modules/catalog/pages/EquiposView.vue')
const SearchEquiposView = () => import('@/modules/catalog/pages/SearchEquiposView.vue')
const ProductView = () => import('@/modules/catalog/pages/ProductView.vue')
const CartView = () => import('@/modules/catalog/pages/CartView.vue')

export const catalogRoutes: RouteRecordRaw[] = [
  {
    path: '/shop',
    name: 'shop',
    component: ShopView,
  },
  {
    path: '/shop/micas',
    name: 'shop-Micas',
    component: MicasView,
  },
  {
    path: '/shop/micas/search',
    name: 'shop-search-Micas',
    component: SearchMicasView,
  },
  {
    path: '/shop/armazones',
    name: 'shop-Armazones',
    component: ArmazonesView,
  },
  {
    path: '/shop/armazones/search',
    name: 'shop-search-Armazones',
    component: SearchArmazonesView,
  },
  {
    path: '/shop/equipos',
    name: 'shop-Equipos',
    component: EquiposView,
  },
  {
    path: '/shop/equipos/search',
    name: 'shop-search-Equipos',
    component: SearchEquiposView,
  },
  {
    path: '/shop/products/:code',
    name: 'product',
    component: ProductView,
  },
  {
    path: '/shop/cart',
    name: 'cart',
    component: CartView,
    beforeEnter: requireAuth,
  },
]
