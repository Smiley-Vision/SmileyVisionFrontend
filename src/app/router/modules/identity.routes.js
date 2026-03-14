const LoginView = () => import('@/contexts/identity/pages/LoginView.vue')
const ProfileView = () => import('@/contexts/identity/pages/ProfileView.vue')

import { requireAuth } from '../guards/requireAuth'

export const identityRoutes = [
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/profile',
        name: 'profile',
        component: ProfileView,
        beforeEnter: requireAuth
    }
]
