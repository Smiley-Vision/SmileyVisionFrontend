import smileyApi from '@/modules/core/api/smileyApi'
import type { Address, AddressPayload } from '@/modules/user/interfaces/Address'

interface ApiListResponse<T> {
  data: T[]
}

interface ApiItemResponse<T> {
  data: T
}

export async function getUserAddressesService() {
  return (await smileyApi.get<ApiListResponse<Address>>('/addresses')).data
}

export async function createAddressService(body: AddressPayload) {
  return (await smileyApi.post<ApiItemResponse<Address>>('/addresses', body)).data
}

export async function updateAddressService(addressId: number, body: AddressPayload) {
  return (await smileyApi.put<ApiItemResponse<Address>>(`/addresses/${addressId}`, body)).data
}

export async function deleteAddressService(addressId: number) {
  return (await smileyApi.delete<ApiItemResponse<Address>>(`/addresses/${addressId}`)).data
}

export async function updateDefaultAddressService(addressId: number) {
  return (await smileyApi.patch<ApiItemResponse<Address>>(`/addresses/${addressId}/default`)).data
}
