const ShopView = () => import('@/contexts/catalog/pages/ShopView.vue')
const MicasView = () => import('@/contexts/catalog/pages/MicasView.vue')
const SearchMicasView = () => import('@/contexts/catalog/pages/SearchMicasView.vue')
const ArmazonesView = () => import('@/contexts/catalog/pages/ArmazonesView.vue')
const SearchArmazonesView = () => import('@/contexts/catalog/pages/SearchArmazonesView.vue')
const EquiposView = () => import('@/contexts/catalog/pages/EquiposView.vue')
const SearchEquiposView = () => import('@/contexts/catalog/pages/SearchEquiposView.vue')
const ProductView = () => import('@/contexts/catalog/pages/ProductView.vue')
const CartView = () => import('@/contexts/catalog/pages/CartView.vue')

import { requireAuth } from '../guards/requireAuth'

export const catalogRoutes = [
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
