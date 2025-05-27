import { createRouter, createWebHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import AboutView from "@/views/AboutView.vue"
import ShopView from "@/views/ShopView.vue"
import ContactView from "@/views/ContactView.vue"
import LoginView from "@/views/LoginView.vue"
import ProductsView from "@/views/admin/ProductsView.vue"
import RegisterView from "@/views/admin/RegisterView.vue"
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
            path: '/admin/products',
            name: 'admin-products',
            component: ProductsView
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