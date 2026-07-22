import type { RouteRecordRaw } from 'vue-router'

const HomeView = () => import('@/modules/marketing/pages/HomeView.vue')

export const marketingRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
]
