const HomeView = () => import('@/modules/marketing/pages/HomeView.vue')
const AboutView = () => import('@/modules/marketing/pages/AboutView.vue')
const ContactView = () => import('@/modules/marketing/pages/ContactView.vue')
const PrivacyView = () => import('@/modules/marketing/pages/PrivacyView.vue')
const TermsView = () => import('@/modules/marketing/pages/TermsView.vue')

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
