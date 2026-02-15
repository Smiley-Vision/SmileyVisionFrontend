import { fetchData } from '@/shared/infrastructure/http/api'

export async function createRegistrationRequestService(body) {
    return fetchData('register-requests', 'POST', body)
}

export async function getRegistrationRequestsService() {
    return fetchData('register-requests', 'GET')
}

export async function getRegistrationRequestByIdService(id) {
    return fetchData(`register-requests/${id}`, 'GET')
}

export async function deleteRegistrationRequestService(id) {
    return fetchData(`register-requests/${id}`, 'DELETE')
}

export async function sendRegisterMailService(body) {
    return fetchData('send-register-mail', 'POST', body)
}

export async function getStoresService() {
    return fetchData('stores', 'GET')
}

export async function registerService(body) {
    return fetchData('register', 'POST', body)
}

export async function markRegisterTokenService(token) {
    return fetchData('mark-register-token', 'POST', { token })
}
