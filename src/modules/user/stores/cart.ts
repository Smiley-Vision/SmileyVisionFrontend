import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  getProductConfigurationsService,
  getProductItemsService,
  getProductsService,
} from '@/modules/catalog/services/catalogService'
import { useAuthStore } from '@/modules/core/stores/auth'
import { normalizeProductListPayload } from '@/modules/core/utils/productApiAdapters'
import { PRODUCT_CATEGORY_ID } from '@/modules/user/constants/productCategories'
import type {
  CartItem,
  CartProductInput,
  RawShoppingCartItem,
} from '@/modules/user/interfaces/Cart'
import {
  addOrUpdateCartItemService,
  getCartItemsService,
  removeCartItemService,
} from '@/modules/user/services/cartService'

const STORAGE_PREFIX = 'sv_cart_state_v1'

function toNumber(value: unknown, fallback?: number): number
function toNumber(value: unknown, fallback: null): number | null
function toNumber(value: unknown, fallback: number | null = 0): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeProductItemsPayload(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload
  const wrapped = (payload as { product_items?: unknown })?.product_items
  return Array.isArray(wrapped) ? wrapped : []
}

function normalizeCartItemsPayload(payload: unknown): RawShoppingCartItem[] {
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
  const productItemImage = String(productItem?.product_image ?? productItem?.image_url ?? '').trim()
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

export const useCartStore = defineStore('cart', () => {
  const auth = useAuthStore()

  const items = ref<CartItem[]>([])
  const initializedUserId = ref<number | null>(null)
  const hasLoadedRemoteForUser = ref(false)
  const isSyncing = ref(false)

  const itemCount = computed(() =>
    items.value.reduce((acc, item) => acc + toNumber(item.quantity), 0),
  )
  const subtotal = computed(() =>
    items.value.reduce((acc, item) => acc + toNumber(item.price) * toNumber(item.quantity), 0),
  )
  const hasItems = computed(() => items.value.length > 0)
  const canUseCart = computed(() => auth.isAuthenticated && auth.isBuyer)

  function getStorageKey(userId: number) {
    return `${STORAGE_PREFIX}_${userId}`
  }

  function resetRuntimeState() {
    items.value = []
  }

  function persistCartState() {
    if (!canUseCart.value || !auth.user?.id) return

    localStorage.setItem(
      getStorageKey(Number(auth.user.id)),
      JSON.stringify({ items: items.value }),
    )
  }

  function hydrateFromLocalCache(currentUserId: number) {
    try {
      const savedState = JSON.parse(localStorage.getItem(getStorageKey(currentUserId)) ?? '{}')
      const savedItems = Array.isArray(savedState?.items) ? savedState.items : []

      items.value = savedItems
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
      resetRuntimeState()
    }
  }

  async function enrichCartItems(rawCartItems: RawShoppingCartItem[]): Promise<CartItem[]> {
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

    const productsById = products.reduce<Record<number, Record<string, unknown>>>(
      (map, product) => {
        if (product?.id != null) {
          map[Number(product.id)] = product
        }
        return map
      },
      {},
    )

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
          (order[normalize(left.variation_name)] ?? 99) -
          (order[normalize(right.variation_name)] ?? 99)
        )
      })
    })

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

  async function fetchCartItems() {
    if (!canUseCart.value || !auth.user?.id) {
      resetRuntimeState()
      return []
    }

    const rawItems = normalizeCartItemsPayload(await getCartItemsService())

    items.value = await enrichCartItems(rawItems)
    persistCartState()

    return items.value
  }

  async function initializeForSession({ forceRemote = false }: { forceRemote?: boolean } = {}) {
    if (!canUseCart.value || !auth.user?.id) {
      initializedUserId.value = null
      hasLoadedRemoteForUser.value = false
      resetRuntimeState()
      return
    }

    const currentUserId = Number(auth.user.id)
    const isSameUser = initializedUserId.value === currentUserId

    if (!isSameUser) {
      initializedUserId.value = currentUserId
      hasLoadedRemoteForUser.value = false
      resetRuntimeState()
      hydrateFromLocalCache(currentUserId)
    }

    if (hasLoadedRemoteForUser.value && !forceRemote) {
      return
    }

    await fetchCartItems()
    hasLoadedRemoteForUser.value = true
  }

  function normalizeProductForCart(product: CartProductInput): Omit<CartItem, 'quantity'> {
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

  function upsertLocalItem(productData: Omit<CartItem, 'quantity'>, quantity: number) {
    const sanitizedQuantity = Math.max(1, toNumber(quantity, 1))
    const existingIndex = items.value.findIndex(
      (item) => item.product_item_id === productData.product_item_id,
    )

    if (existingIndex >= 0) {
      items.value[existingIndex] = {
        ...items.value[existingIndex],
        ...productData,
        quantity: sanitizedQuantity,
      }
    } else {
      items.value.push({ ...productData, quantity: sanitizedQuantity })
    }
  }

  function assertCartUsable() {
    if (!auth.isAuthenticated) {
      throw new Error('Necesitas iniciar sesión para usar el carrito.')
    }

    if (!canUseCart.value) {
      throw new Error('El carrito solo esta disponible para usuarios compradores.')
    }
  }

  async function addProduct(product: CartProductInput, quantityDelta = 1) {
    await initializeForSession()
    assertCartUsable()

    const normalizedProduct = normalizeProductForCart(product)
    const existing = items.value.find(
      (item) => item.product_item_id === normalizedProduct.product_item_id,
    )
    const nextQuantity = Math.max(
      1,
      toNumber(existing?.quantity, 0) + Math.max(1, toNumber(quantityDelta, 1)),
    )

    isSyncing.value = true
    try {
      await addOrUpdateCartItemService(normalizedProduct.product_item_id, nextQuantity)
      upsertLocalItem(normalizedProduct, nextQuantity)
      persistCartState()
    } finally {
      isSyncing.value = false
    }
  }

  async function addProducts(products: CartProductInput[], quantityDelta = 1) {
    await initializeForSession()
    assertCartUsable()

    const normalizedProducts = products
      .map((product) => normalizeProductForCart(product))
      .filter((product) => product.product_item_id)

    if (normalizedProducts.length === 0) {
      throw new Error('No hay productos válidos para agregarse al carrito.')
    }

    isSyncing.value = true
    try {
      for (const normalizedProduct of normalizedProducts) {
        const existing = items.value.find(
          (item) => item.product_item_id === normalizedProduct.product_item_id,
        )
        const nextQuantity = Math.max(
          1,
          toNumber(existing?.quantity, 0) + Math.max(1, toNumber(quantityDelta, 1)),
        )

        await addOrUpdateCartItemService(normalizedProduct.product_item_id, nextQuantity)
        upsertLocalItem(normalizedProduct, nextQuantity)
      }

      persistCartState()
    } finally {
      isSyncing.value = false
    }
  }

  async function setItemQuantity(productItemId: number, quantity: number) {
    await initializeForSession()

    const normalizedItemId = toNumber(productItemId, null)
    if (!normalizedItemId) return

    const nextQuantity = Math.max(0, toNumber(quantity, 0))
    if (nextQuantity <= 0) {
      await removeItem(normalizedItemId)
      return
    }

    const existing = items.value.find((item) => item.product_item_id === normalizedItemId)
    if (!existing) return

    isSyncing.value = true
    try {
      await addOrUpdateCartItemService(normalizedItemId, nextQuantity)
      upsertLocalItem(existing, nextQuantity)
      persistCartState()
    } finally {
      isSyncing.value = false
    }
  }

  async function removeItem(productItemId: number) {
    await initializeForSession()

    const normalizedItemId = toNumber(productItemId, null)
    if (!normalizedItemId) return

    isSyncing.value = true
    try {
      await removeCartItemService(normalizedItemId)
      items.value = items.value.filter((item) => item.product_item_id !== normalizedItemId)
      persistCartState()
    } finally {
      isSyncing.value = false
    }
  }

  function clearLocalCart() {
    if (!canUseCart.value || !auth.user?.id) return

    localStorage.removeItem(getStorageKey(Number(auth.user.id)))
    resetRuntimeState()
  }

  return {
    items,
    itemCount,
    subtotal,
    hasItems,
    isSyncing,
    canUseCart,
    initializeForSession,
    fetchCartItems,
    addProduct,
    addProducts,
    removeItem,
    setItemQuantity,
    clearLocalCart,
  }
})
