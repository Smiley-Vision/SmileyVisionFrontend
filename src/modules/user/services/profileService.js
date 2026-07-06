import smileyApi from '@/modules/core/api/smileyApi'

export async function getUserAddressesService() {
  return (await smileyApi.get('/addresses')).data
}

export async function createAddressService(body) {
  return (await smileyApi.post('/addresses', body)).data
}

export async function updateAddressService(addressId, body) {
  return (await smileyApi.put(`/addresses/${addressId}`, body)).data
}

export async function deleteAddressService(addressId) {
  return (await smileyApi.delete(`/addresses/${addressId}`)).data
}

export async function updateDefaultAddressService(addressId) {
  return (await smileyApi.patch(`/addresses/${addressId}/default`)).data
}
