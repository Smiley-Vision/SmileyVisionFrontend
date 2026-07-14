import type { RouteRecordRaw } from 'vue-router'
import { requireAdmin } from '../guards/requireAdmin'

const RegistrationFormView = () => import('@/modules/registration/views/RegistrationFormView.vue')
const RegistrationApplicationsView = () => import('@/modules/registration/views/RegistrationApplicationsView.vue')
const RequestRegistrationView = () => import('@/modules/registration/views/RequestRegistrationView.vue')

export const registrationRoutes: RouteRecordRaw[] = [
  {
    path: '/sign-up',
    name: 'registration-form',
    component: RegistrationFormView,
  },
  {
    path: '/register',
    name: 'request-registration',
    component: RequestRegistrationView,
  },
  {
    path: '/admin/registration-applications',
    name: 'admin-registration-applications',
    component: RegistrationApplicationsView,
    meta: {
      requireAdmin
    }
  },
]
