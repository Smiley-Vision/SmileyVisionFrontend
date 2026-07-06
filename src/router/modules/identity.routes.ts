import type { RouteRecordRaw } from 'vue-router'

import { requireAuth } from '../guards/requireAuth'

const LoginView = () => import('@/modules/auth/views/LoginView.vue')
const ProfileView = () => import('@/modules/user/views/ProfileView.vue')

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
