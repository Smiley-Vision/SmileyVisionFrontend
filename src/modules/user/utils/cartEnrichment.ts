import {
  getProductById,
  getProductConfigurationsByItem,
  getProductItemById,
} from '@/modules/catalog/services/catalogService'
import type { Product } from '@/modules/catalog/interfaces/Product'
import type { ProductItem } from '@/modules/catalog/interfaces/ProductItem'
import { PRODUCT_CATEGORY_ID } from '@/modules/user/constants/productCategories'
import type {
  CartItem,
  CartItemVariationOption,
  CartProductInput,
  RawShoppingCartItem,
} from '@/modules/user/interfaces/Cart'

export function toNumber(value: unknown, fallback?: number): number
export function toNumber(value: unknown, fallback: null): number | null
export function toNumber(value: unknown, fallback: number | null = 0): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function normalizeCartItemsPayload(payload: unknown): RawShoppingCartItem[] {
  if (Array.isArray(payload)) return payload
  const items = (payload as { items?: unknown })?.items
  if (Array.isArray(items)) return items
  const cartItems = (payload as { cart_items?: unknown })?.cart_items
  if (Array.isArray(cartItems)) return cartItems

  return []
}

function getCartItemImage(product: Product | undefined, productItem: ProductItem | undefined): string {
  const productItemImage = String(productItem?.image_path ?? '').trim()
  const productImage = String(product?.image_path ?? '').trim()

  if (
    product?.category_id === PRODUCT_CATEGORY_ID.MICA ||
    product?.category_id === PRODUCT_CATEGORY_ID.ARMAZON
  ) {
    return productItemImage || productImage
  }

  return productImage || productItemImage
}

export async function enrichCartItems(rawCartItems: RawShoppingCartItem[]): Promise<CartItem[]> {
  if (!rawCartItems.length) return []

  const uniqueItemIds = [
    ...new Set(rawCartItems.map((row) => toNumber(row?.product_item_id, 0)).filter(Boolean)),
  ]

  const productItems = await Promise.all(
    uniqueItemIds.map((itemId) => getProductItemById(itemId).catch(() => null)),
  )
  const productItemsById = new Map(
    productItems
      .filter((item): item is ProductItem => item !== null)
      .map((item) => [item.id, item]),
  )

  const uniqueProductIds = [
    ...new Set([...productItemsById.values()].map((item) => item.product_id)),
  ]
  const products = await Promise.all(
    uniqueProductIds.map((productId) => getProductById(productId).catch(() => null)),
  )
  const productsById = new Map(
    products.filter((product): product is Product => product !== null).map((product) => [product.id, product]),
  )

  // Only frame items carry variation options (color/material); fetching
  // configurations is scoped to just those items instead of every item.
  const frameItemIds = [...productItemsById.values()]
    .filter((item) => productsById.get(item.product_id)?.category_id === PRODUCT_CATEGORY_ID.ARMAZON)
    .map((item) => item.id)

  const configurationEntries = await Promise.all(
    frameItemIds.map(
      async (itemId): Promise<[number, CartItemVariationOption[]]> => [
        itemId,
        (await getProductConfigurationsByItem(itemId).catch(() => [])).map((configuration) => ({
          variation_id: null,
          variation_name: configuration.variation,
          option_id: null,
          option_value: configuration.value,
        })),
      ],
    ),
  )
  const configurationsByItemId = new Map(configurationEntries)

  return rawCartItems
    .map((row): CartItem => {
      const normalizedItemId = toNumber(row?.product_item_id, 0)
      const normalizedCartId = toNumber(row?.cart_id, null)
      const quantity = Math.max(1, toNumber(row?.quantity, 1))

      const productItem = productItemsById.get(normalizedItemId)
      const productId = productItem?.product_id ?? null
      const product = productId !== null ? productsById.get(productId) : undefined

      return {
        cart_id: normalizedCartId,
        product_item_id: normalizedItemId,
        product_id: productId,
        category_id: product?.category_id ?? null,
        code: String(productItem?.SKU ?? normalizedItemId ?? ''),
        sku: String(productItem?.SKU ?? ''),
        name: String(product?.name ?? `Producto #${normalizedItemId}`),
        description: String(product?.description ?? ''),
        image_path: getCartItemImage(product, productItem),
        price: toNumber(productItem?.price, 0),
        stock: toNumber(productItem?.stock, 0),
        variation_options: configurationsByItemId.get(normalizedItemId) ?? [],
        quantity,
      }
    })
    .filter((item) => item.product_item_id)
}

export function normalizeProductForCart(product: CartProductInput): Omit<CartItem, 'quantity'> {
  const productItemId = toNumber(product?.product_item_id, null)

  if (!productItemId) {
    throw new Error('El producto no tiene product_item_id para agregarse al carrito.')
  }

  return {
    cart_id: null,
    product_item_id: productItemId,
    product_id: toNumber(product?.id, null),
    category_id: toNumber(product?.category_id, null),
    code: String(product?.code ?? product?.SKU ?? productItemId),
    sku: String(product?.SKU ?? product?.code ?? productItemId),
    name: String(product?.name ?? ''),
    description: String(product?.description ?? ''),
    image_path: String(product?.image_path ?? product?.product_image ?? ''),
    price: toNumber(product?.price, 0),
    stock: toNumber(product?.stock, 0),
    variation_options: product?.variation_options ?? [],
  }
}
