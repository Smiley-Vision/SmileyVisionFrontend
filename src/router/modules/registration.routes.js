const UserRegisterView = () => import('@/modules/registration/pages/UserRegisterView.vue')
const RegisterView = () => import('@/modules/registration/pages/RegisterView.vue')

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
