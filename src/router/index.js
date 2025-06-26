import { createRouter, createWebHistory } from "vue-router"

// General, guest views
import HomeView from "@/views/HomeView.vue"
import AboutView from "@/views/AboutView.vue"
import ShopView from "@/views/ShopView.vue"
import ContactView from "@/views/ContactView.vue"

// Type-specific product views
import MicasView from "@/views/shop/MicasView.vue"
import ArmazonesView from "@/views/shop/ArmazonesView.vue"
import EquiposView from "@/views/shop/EquiposView.vue"

// Product views
import ProductView from "@/views/shop/products/ProductView.vue"

// Login, register views
import LoginView from "@/views/LoginView.vue"
import RegisterView from "@/views/admin/RegisterView.vue"
import UserRegisterView from "@/views/UserRegisterView.vue"

// Admin product management views
import ProductsView from "@/views/admin/ProductsView.vue"
import ModifyProductView from "@/views/admin/products/ModifyProductView.vue"
import ManageProductAvailabilityView from "@/views/admin/products/ManageProductAvailabilityView.vue"

// Admin product management forms
import CreateProductForm from "@/views/admin/products/forms/CreateProductForm.vue"
import ModifyProductForm from "@/views/admin/products/forms/ModifyProductForm.vue"

// 404 error!
import NotFoundView from "@/views/NotFoundView.vue"

import { useAuthStore } from "@/stores/auth"

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/about',
            name: 'about',
            component: AboutView
        },
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
            path: '/shop/armazones',
            name: 'shop-Armazones',
            component: ArmazonesView
        },
        {
            path: '/shop/equipos',
            name: 'shop-Equipos',
            component: EquiposView
        },
        {
            path: '/shop/products/:code',
            name: 'product',
            component: ProductView
        },
        {
            path: '/contact',
            name: 'contact',
            component: ContactView
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/register',
            name: 'register',
            component: UserRegisterView
        },
        {
            path: '/admin/products',
            name: 'admin-products',
            component: ProductsView
        },
        {
            path: '/admin/products/create',
            name: 'admin-products-create',
            component: CreateProductForm
        },
        {
            path: '/admin/products/modify/:code',
            name: 'admin-products-modify-form',
            component: ModifyProductForm
        },
        {
            path: '/admin/products/modify',
            name: 'admin-products-modify',
            component: ModifyProductView
        },
        {
            path: '/admin/products/availability',
            name: 'admin-products-availability',
            component: ManageProductAvailabilityView
        },
        {
            path: '/admin/register',
            name: 'admin-register',
            component: RegisterView
        },
        {
            path: '/:catchAll(.*)',
            name: 'not-found',
            component: NotFoundView
        }
    ]
})

router.beforeEach(async (to, from) => {
    // Used to protect routes through roles
    const auth = useAuthStore()

    // Protect all the admin routes
    if (!auth.isAuthenticated &&
        to.name.startsWith('admin') ||
        auth.isAuthenticated && !auth.isAdmin &&
        to.name.startsWith('admin')
    ) {
        // Redirect to login view
        return { name: 'login' }
    }
})

export default router