const HomeView = () => import('@/contexts/marketing/pages/HomeView.vue')
const AboutView = () => import('@/contexts/marketing/pages/AboutView.vue')
const ContactView = () => import('@/contexts/marketing/pages/ContactView.vue')
const PrivacyView = () => import('@/contexts/marketing/pages/PrivacyView.vue')
const TermsView = () => import('@/contexts/marketing/pages/TermsView.vue')

export const marketingRoutes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactView,
  },
  {
    path: '/aviso-de-privacidad',
    name: 'privacy',
    component: PrivacyView,
  },
  {
    path: '/terminos-y-condiciones',
    name: 'terms',
    component: TermsView,
  },
]
