import HomeView from '@/contexts/marketing/pages/HomeView.vue'
import AboutView from '@/contexts/marketing/pages/AboutView.vue'
import ContactView from '@/contexts/marketing/pages/ContactView.vue'

export const marketingRoutes = [
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
        path: '/contact',
        name: 'contact',
        component: ContactView
    }
]
