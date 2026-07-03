import { api } from '@/modules/shared/infrastructure/http/api'

export async function getAuthenticatedUserService() {
  return (await api.get('user')).data
}

export async function getUserAddressesService(userId) {
  return (await api.get(`users/${userId}/addresses`)).data
}

export async function createAddressService(body) {
  return (await api.post('addresses', body)).data
}

export async function updateDefaultAddressService(userId, addressId) {
  return (await api.post(`addresses/update-default/${userId}/${addressId}`)).data
}
