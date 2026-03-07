const HomeView = () => import('@/contexts/marketing/pages/HomeView.vue')
const AboutView = () => import('@/contexts/marketing/pages/AboutView.vue')
const ContactView = () => import('@/contexts/marketing/pages/ContactView.vue')

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
