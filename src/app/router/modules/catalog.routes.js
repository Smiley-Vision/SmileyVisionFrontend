import ShopView from '@/contexts/catalog/pages/ShopView.vue'
import MicasView from '@/contexts/catalog/pages/MicasView.vue'
import SearchMicasView from '@/contexts/catalog/pages/SearchMicasView.vue'
import ArmazonesView from '@/contexts/catalog/pages/ArmazonesView.vue'
import SearchArmazonesView from '@/contexts/catalog/pages/SearchArmazonesView.vue'
import EquiposView from '@/contexts/catalog/pages/EquiposView.vue'
import SearchEquiposView from '@/contexts/catalog/pages/SearchEquiposView.vue'
import ProductView from '@/contexts/catalog/pages/ProductView.vue'

export const catalogRoutes = [
    {
        path: '/shop',
        name: 'shop',
        component: ShopView
    },
    {
        path: '/shop/micas',
        name: 'shop-Micas',
        component: MicasView
    },
    {
        path: '/shop/micas/search',
        name: 'shop-search-Micas',
        component: SearchMicasView
    },
    {
        path: '/shop/armazones',
        name: 'shop-Armazones',
        component: ArmazonesView
    },
    {
        path: '/shop/armazones/search',
        name: 'shop-search-Armazones',
        component: SearchArmazonesView
    },
    {
        path: '/shop/equipos',
        name: 'shop-Equipos',
        component: EquiposView
    },
    {
        path: '/shop/equipos/search',
        name: 'shop-search-Equipos',
        component: SearchEquiposView
    },
    {
        path: '/shop/products/:code',
        name: 'product',
        component: ProductView
    }
]
