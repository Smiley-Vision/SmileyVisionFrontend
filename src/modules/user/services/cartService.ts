import smileyApi from '@/modules/core/api/smileyApi'
import type { RawShoppingCartItem } from '@/modules/user/interfaces/Cart'

interface ApiItemResponse<T> {
  message: string
  data: T
}

export async function getCartItemsService() {
  return (await smileyApi.get<RawShoppingCartItem[]>('/cart-items')).data
}

export async function addOrUpdateCartItemService(productItemId: number, quantity: number) {
  return (
    await smileyApi.post<ApiItemResponse<RawShoppingCartItem>>(`/cart-items/${productItemId}`, {
      quantity,
    })
  ).data
}

export async function removeCartItemService(productItemId: number) {
  return (
    await smileyApi.delete<ApiItemResponse<RawShoppingCartItem>>(`/cart-items/${productItemId}`)
  ).data
}
