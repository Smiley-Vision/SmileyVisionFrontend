import UserRegisterView from '@/contexts/registration/pages/UserRegisterView.vue'
import RegisterView from '@/contexts/registration/pages/RegisterView.vue'

export const registrationRoutes = [
    {
        path: '/register',
        name: 'register',
        component: UserRegisterView
    },
    {
        path: '/admin/register',
        name: 'admin-register',
        component: RegisterView
    }
]
