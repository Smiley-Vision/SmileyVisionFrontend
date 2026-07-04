import type { RouteRecordRaw } from 'vue-router'

import { requireAuth } from '../guards/requireAuth'

const LoginView = () => import('@/modules/identity/pages/LoginView.vue')
const ProfileView = () => import('@/modules/identity/pages/ProfileView.vue')

export const identityRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    beforeEnter: requireAuth,
  },
]
