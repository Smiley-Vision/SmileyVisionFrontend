import { fetchData } from '@/shared/infrastructure/http/api'

export async function loginService(email, password) {
    return fetchData('login', 'POST', { email, password })
}

export async function logoutService() {
    return fetchData('logout', 'POST')
}

export async function checkRegisterTokenService(token) {
    return fetchData(`check-register-token?token=${token}`, 'GET')
}
