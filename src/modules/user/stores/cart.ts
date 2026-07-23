import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useAuthStore } from '@/modules/core/stores/auth'
import type { CartItem, CartProductInput } from '@/modules/user/interfaces/Cart'
import {
  addOrUpdateCartItemService,
  getCartItemsService,
  removeCartItemService,
} from '@/modules/user/services/cartService'
import {
  enrichCartItems,
  normalizeCartItemsPayload,
  normalizeProductForCart,
  toNumber,
} from '@/modules/user/utils/cartEnrichment'
import { clearCartState, loadCartState, saveCartState } from '@/modules/user/utils/cartPersistence'

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

  function resetRuntimeState() {
    items.value = []
  }

  function persistCartState() {
    if (!canUseCart.value || !auth.user?.id) return
    saveCartState(Number(auth.user.id), items.value)
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
      items.value = loadCartState(currentUserId)
    }

    if (hasLoadedRemoteForUser.value && !forceRemote) {
      return
    }

    await fetchCartItems()
    hasLoadedRemoteForUser.value = true
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

    clearCartState(Number(auth.user.id))
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
