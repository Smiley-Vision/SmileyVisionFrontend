const LoginView = () => import('@/contexts/identity/pages/LoginView.vue')

export const identityRoutes = [
    {
        path: '/login',
        name: 'login',
        component: LoginView
    }
]
