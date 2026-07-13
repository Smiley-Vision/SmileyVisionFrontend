import {
  getProductConfigurationsService,
  getProductItemsService,
  getProductsService,
} from '@/modules/catalog/services/catalogService'
import { normalizeProductListPayload } from '@/modules/core/utils/productApiAdapters'
import { PRODUCT_CATEGORY_ID } from '@/modules/user/constants/productCategories'
import type {
  CartItem,
  CartProductInput,
  RawShoppingCartItem,
} from '@/modules/user/interfaces/Cart'

export function toNumber(value: unknown, fallback?: number): number
export function toNumber(value: unknown, fallback: null): number | null
export function toNumber(value: unknown, fallback: number | null = 0): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function normalizeProductItemsPayload(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload
  const data = (payload as { data?: unknown })?.data
  if (Array.isArray(data)) return data
  const wrapped = (payload as { product_items?: unknown })?.product_items
  return Array.isArray(wrapped) ? wrapped : []
}

export function normalizeCartItemsPayload(payload: unknown): RawShoppingCartItem[] {
  if (Array.isArray(payload)) return payload
  const items = (payload as { items?: unknown })?.items
  if (Array.isArray(items)) return items
  const cartItems = (payload as { cart_items?: unknown })?.cart_items
  if (Array.isArray(cartItems)) return cartItems

  return []
}

function getProductItemStock(productItem: Record<string, unknown> | undefined): number {
  const directStock = [
    productItem?.stock,
    productItem?.total_stock,
    productItem?.available_stock,
    productItem?.availability,
    productItem?.existence,
  ]
    .map((value) => toNumber(value, null))
    .find((value) => value !== null)

  if (directStock !== undefined) return Math.max(0, directStock)

  const inventoryRows = (
    Array.isArray(productItem?.inventory)
      ? productItem.inventory
      : Array.isArray(productItem?.inventories)
        ? productItem.inventories
        : Array.isArray(productItem?.inventory_items)
          ? productItem.inventory_items
          : []
  ) as Record<string, unknown>[]

  return inventoryRows.reduce(
    (total, inventoryRow) => total + Math.max(0, toNumber(inventoryRow?.stock, 0)),
    0,
  )
}

function getCartItemImage(
  product: Record<string, unknown> | undefined,
  productItem: Record<string, unknown> | undefined,
): string {
  const categoryId = toNumber(product?.category_id, null)
  const productItemImage = String(
    productItem?.image_path ?? productItem?.product_image ?? productItem?.image_url ?? '',
  ).trim()
  const productImage = String(product?.image_url ?? product?.product_image ?? '').trim()

  if (
    categoryId !== null &&
    (categoryId === PRODUCT_CATEGORY_ID.MICA || categoryId === PRODUCT_CATEGORY_ID.ARMAZON) &&
    productItemImage
  ) {
    return productItemImage
  }

  return productImage || productItemImage
}

function buildVariationOptionsByItemId(
  productConfigurations: Record<string, unknown>[],
): Record<number, CartItem['variation_options']> {
  const variationOptionsByItemId = productConfigurations.reduce<
    Record<number, CartItem['variation_options']>
  >((map, configuration) => {
    const itemId = toNumber(configuration?.product_item_id, null)
    const variationOption = configuration?.variation_option as Record<string, unknown>
    const variation = variationOption?.variation as Record<string, unknown>

    if (!itemId || !variationOption) return map

    if (!Array.isArray(map[itemId])) {
      map[itemId] = []
    }

    map[itemId].push({
      variation_id: toNumber(variation?.id ?? variationOption?.variation_id, null),
      variation_name: String(variation?.name ?? ''),
      option_id: toNumber(variationOption?.id ?? configuration?.variation_option_id, null),
      option_value: String(variationOption?.value ?? ''),
    })

    return map
  }, {})

  Object.values(variationOptionsByItemId).forEach((variationOptions) => {
    variationOptions.sort((left, right) => {
      const order: Record<string, number> = { color: 1, material: 2 }
      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()

      return (
        (order[normalize(left.variation_name)] ?? 99) - (order[normalize(right.variation_name)] ?? 99)
      )
    })
  })

  return variationOptionsByItemId
}

export async function enrichCartItems(rawCartItems: RawShoppingCartItem[]): Promise<CartItem[]> {
  if (!rawCartItems.length) return []

  const [productItemsPayload, productsPayload, productConfigurationsPayload] = await Promise.all([
    getProductItemsService(),
    getProductsService(),
    getProductConfigurationsService().catch(() => []),
  ])

  const productItems = normalizeProductItemsPayload(productItemsPayload)
  const products = normalizeProductListPayload(productsPayload) as Record<string, unknown>[]
  const productConfigurations = Array.isArray(productConfigurationsPayload)
    ? (productConfigurationsPayload as Record<string, unknown>[])
    : []

  const productItemsById = productItems.reduce<Record<number, Record<string, unknown>>>(
    (map, productItem) => {
      if (productItem?.id != null) {
        map[Number(productItem.id)] = productItem
      }
      return map
    },
    {},
  )

  const productsById = products.reduce<Record<number, Record<string, unknown>>>((map, product) => {
    if (product?.id != null) {
      map[Number(product.id)] = product
    }
    return map
  }, {})

  const variationOptionsByItemId = buildVariationOptionsByItemId(productConfigurations)

  return rawCartItems
    .map((row): CartItem => {
      const normalizedItemId = toNumber(row?.product_item_id, 0)
      const normalizedCartId = toNumber(row?.cart_id, null)
      const quantity = Math.max(1, toNumber(row?.quantity, 1))

      const productItem = productItemsById[normalizedItemId]
      const productId = toNumber(productItem?.product_id, null)
      const product = productId !== null ? productsById[productId] : undefined
      const cartItemImage = getCartItemImage(product, productItem)

      return {
        cart_id: normalizedCartId,
        product_item_id: normalizedItemId,
        product_id: productId,
        category_id: toNumber(product?.category_id, null),
        code: String(product?.code ?? productItem?.SKU ?? normalizedItemId ?? ''),
        sku: String(productItem?.SKU ?? ''),
        name: String(product?.name ?? `Producto #${normalizedItemId}`),
        description: String(product?.description ?? ''),
        image_path: cartItemImage,
        price: toNumber(productItem?.price ?? product?.price, 0),
        stock: getProductItemStock(productItem),
        variation_options: variationOptionsByItemId[normalizedItemId] ?? [],
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
