import { parseLensSku } from '@/modules/core/utils/productApiAdapters'
import { PRODUCT_CATEGORY_ID } from '@/modules/user/constants/productCategories'
import type { CartItem, CartItemVariationOption, LensDetails } from '@/modules/user/interfaces/Cart'

const backendUrl = import.meta.env.VITE_BACKEND_BASE

export function getCartItemImageSrc(item: CartItem): string {
  return `${backendUrl}/storage/${item.image_path}`
}

export interface StockStatus {
  label: string
  className: string
}

export function getStockStatus(item: CartItem): StockStatus {
  const stock = Number(item.stock ?? 0)

  if (stock <= 0) {
    return { label: 'No disponible', className: 'bg-red-600 text-white' }
  }

  return { label: `Disponible: ${stock}`, className: 'bg-emerald-100 text-emerald-700' }
}

export function isLensItem(item: CartItem): boolean {
  return Number(item.category_id) === PRODUCT_CATEGORY_ID.MICA
}

export function getLensDetails(item: CartItem): LensDetails | null {
  if (!isLensItem(item)) return null

  return parseLensSku(item.sku || item.code)
}

export function getVariationDetails(item: CartItem): CartItemVariationOption[] {
  if (Number(item.category_id) !== PRODUCT_CATEGORY_ID.ARMAZON) return []

  return item.variation_options.filter(
    (variationOption) => variationOption.variation_name && variationOption.option_value,
  )
}

export function getDisplayCode(item: CartItem): string {
  return item.sku || item.code || String(item.product_item_id)
}
