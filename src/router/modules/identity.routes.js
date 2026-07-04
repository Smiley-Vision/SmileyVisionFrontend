const LoginView = () => import('@/modules/identity/pages/LoginView.vue')
const ProfileView = () => import('@/modules/identity/pages/ProfileView.vue')

import { requireAuth } from '../guards/requireAuth'

export const identityRoutes = [
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
