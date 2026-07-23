import type { CartItem } from '@/modules/user/interfaces/Cart'
import { toNumber } from '@/modules/user/utils/cartEnrichment'

const STORAGE_PREFIX = 'sv_cart_state_v1'

function getStorageKey(userId: number) {
  return `${STORAGE_PREFIX}_${userId}`
}

export function saveCartState(userId: number, items: CartItem[]) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify({ items }))
}

export function loadCartState(userId: number): CartItem[] {
  try {
    const savedState = JSON.parse(localStorage.getItem(getStorageKey(userId)) ?? '{}')
    const savedItems = Array.isArray(savedState?.items) ? savedState.items : []

    return savedItems
      .map((item: Partial<CartItem>): CartItem => ({
        cart_id: toNumber(item.cart_id, null),
        product_item_id: toNumber(item.product_item_id, 0),
        product_id: toNumber(item.product_id, null),
        category_id: toNumber(item.category_id, null),
        code: String(item.code ?? ''),
        sku: String(item.sku ?? ''),
        name: String(item.name ?? ''),
        description: String(item.description ?? ''),
        image_path: String(item.image_path ?? ''),
        price: toNumber(item.price),
        stock: toNumber(item.stock),
        variation_options: Array.isArray(item.variation_options) ? item.variation_options : [],
        quantity: Math.max(1, toNumber(item.quantity, 1)),
      }))
      .filter((item: CartItem) => item.product_item_id)
  } catch {
    return []
  }
}

export function clearCartState(userId: number) {
  localStorage.removeItem(getStorageKey(userId))
}
