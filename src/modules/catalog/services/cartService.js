import { api } from '@/modules/shared/infrastructure/http/api'

export async function getCartItemsService() {
  return (await api.get('cart-items')).data
}

export async function addProductToCartService(body) {
  return (await api.post('cart-items', body)).data
}

export async function removeProductFromCartService(cartId, productItemId) {
  return (await api.delete(`cart-items/${cartId}/${productItemId}`)).data
}
