const UserRegisterView = () => import('@/contexts/registration/pages/UserRegisterView.vue')
const RegisterView = () => import('@/contexts/registration/pages/RegisterView.vue')

export const registrationRoutes = [
  {
    path: '/register',
    name: 'register',
    component: UserRegisterView,
  },
  {
    path: '/admin/register',
    name: 'admin-register',
    component: RegisterView,
  },
]
