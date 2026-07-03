import { api } from '@/shared/infrastructure/http/api'

export async function loginService(email, password) {
  return (await api.post('login', { email, password })).data
}

export async function logoutService() {
  return (await api.post('logout')).data
}

export async function checkRegisterTokenService(token) {
  return (await api.get(`check-register-token?token=${token}`)).data
}
