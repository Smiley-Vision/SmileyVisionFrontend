import type { RouteRecordRaw } from 'vue-router'

const HomeView = () => import('@/modules/marketing/pages/HomeView.vue')
const AboutUsView = () => import('@/modules/marketing/pages/AboutUsView.vue')

export const marketingRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/sobre-nosotros',
    name: 'about',
    component: AboutUsView,
  },
]
