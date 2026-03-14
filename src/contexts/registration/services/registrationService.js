import { api } from '@/shared/infrastructure/http/api'

export async function createRegistrationRequestService(body) {
    return (await api.post('register-requests', body)).data
}

export async function getRegistrationRequestsService() {
    return (await api.get('register-requests')).data
}

export async function getRegistrationRequestByIdService(id) {
    return (await api.get(`register-requests/${id}`)).data
}

export async function deleteRegistrationRequestService(id) {
    return (await api.delete(`register-requests/${id}`)).data
}

export async function sendRegisterMailService(body) {
    return (await api.post('send-register-mail', body)).data
}

export async function getStoresService() {
    return []
}

export async function registerService(body) {
    return (await api.post('register', body)).data
}

export async function markRegisterTokenService(token) {
    return (await api.post('mark-register-token', { token })).data
}
