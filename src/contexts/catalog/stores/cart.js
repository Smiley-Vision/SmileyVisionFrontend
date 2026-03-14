import { getProductItemsService, getProductsService } from '@/contexts/catalog/services/catalogService'
import { addProductToCartService, getCartItemsService, removeProductFromCartService } from '@/contexts/catalog/services/cartService'
import { useAuthStore } from '@/contexts/identity/stores/auth'
import { normalizeProductListPayload } from '@/shared/utils/productApiAdapters'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_PREFIX = 'sv_cart_state_v1'

function toNumber(value, fallback = 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeProductItemsPayload(payload) {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.product_items)) return payload.product_items

    return []
}

function normalizeCartItemsPayload(payload) {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.items)) return payload.items
    if (Array.isArray(payload?.cart_items)) return payload.cart_items

    return []
}

export const useCartStore = defineStore('cart', () => {
    const auth = useAuthStore()

    const items = ref([])
    const cartId = ref(null)
    const initializedUserId = ref(null)
    const hasLoadedRemoteForUser = ref(false)
    const isSyncing = ref(false)

    const itemCount = computed(() => items.value.reduce((acc, item) => acc + toNumber(item.quantity), 0))
    const subtotal = computed(() => items.value.reduce((acc, item) => acc + (toNumber(item.price) * toNumber(item.quantity)), 0))
    const hasItems = computed(() => items.value.length > 0)

    function getStorageKey(userId) {
        return `${STORAGE_PREFIX}_${userId}`
    }

    function resetRuntimeState() {
        items.value = []
        cartId.value = null
    }

    function persistCartState() {
        if (!auth.isAuthenticated || !auth.user?.id) return

        localStorage.setItem(getStorageKey(auth.user.id), JSON.stringify({
            cartId: cartId.value,
            items: items.value
        }))
    }

    function hydrateFromLocalCache(currentUserId) {
        try {
            const savedState = JSON.parse(localStorage.getItem(getStorageKey(currentUserId)) ?? '{}')
            const savedItems = Array.isArray(savedState?.items) ? savedState.items : []
            const savedCartId = toNumber(savedState?.cartId, null)

            items.value = savedItems
                .map((item) => ({
                    ...item,
                    price: toNumber(item.price),
                    quantity: Math.max(1, toNumber(item.quantity, 1)),
                    product_item_id: toNumber(item.product_item_id, null),
                    product_id: toNumber(item.product_id, null),
                    cart_id: toNumber(item.cart_id, null)
                }))
                .filter((item) => item.product_item_id)

            cartId.value = savedCartId
        } catch (error) {
            resetRuntimeState()
        }
    }

    async function enrichCartItems(rawCartItems) {
        if (!rawCartItems.length) return []

        const [productItemsPayload, productsPayload] = await Promise.all([
            getProductItemsService(),
            getProductsService()
        ])

        const productItems = normalizeProductItemsPayload(productItemsPayload)
        const products = normalizeProductListPayload(productsPayload)

        const productItemsById = productItems.reduce((map, productItem) => {
            if (productItem?.id != null) {
                map[Number(productItem.id)] = productItem
            }

            return map
        }, {})

        const productsById = products.reduce((map, product) => {
            if (product?.id != null) {
                map[Number(product.id)] = product
            }

            return map
        }, {})

        return rawCartItems
            .map((row) => {
                const normalizedItemId = toNumber(row?.product_item_id, null)
                const normalizedCartId = toNumber(row?.cart_id, null)
                const quantity = Math.max(1, toNumber(row?.quantity, 1))

                const productItem = productItemsById[normalizedItemId]
                const productId = toNumber(productItem?.product_id, null)
                const product = productsById[productId]

                return {
                    cart_id: normalizedCartId,
                    product_item_id: normalizedItemId,
                    product_id: productId,
                    code: String(product?.code ?? productItem?.SKU ?? normalizedItemId ?? ''),
                    name: String(product?.name ?? `Producto #${normalizedItemId}`),
                    description: String(product?.description ?? ''),
                    image_url: String(product?.image_url ?? product?.product_image ?? productItem?.product_image ?? ''),
                    price: toNumber(productItem?.price ?? product?.price, 0),
                    quantity
                }
            })
            .filter((item) => item.product_item_id)
    }

    async function fetchCartItems() {
        if (!auth.isAuthenticated || !auth.user?.id) {
            resetRuntimeState()
            return []
        }

        const payload = await getCartItemsService()
        const rawItems = normalizeCartItemsPayload(payload)

        if (rawItems.length > 0) {
            cartId.value = toNumber(rawItems[0]?.cart_id, cartId.value)
        }

        items.value = await enrichCartItems(rawItems)
        persistCartState()

        return items.value
    }

    async function initializeForSession({ forceRemote = false } = {}) {
        if (!auth.isAuthenticated || !auth.user?.id) {
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

    function normalizeProductForCart(product) {
        const productItemId = toNumber(product?.product_item_id, null)

        if (!productItemId) {
            throw new Error('El producto no tiene product_item_id para agregarse al carrito.')
        }

        return {
            product_item_id: productItemId,
            product_id: toNumber(product?.id, null),
            quantity: 1
        }
    }

    function buildCartIdCandidates() {
        const rawCandidates = [
            cartId.value,
            auth.user?.shopping_cart_id,
            auth.user?.shoppingCart?.id,
            auth.user?.cart_id,
            Number(auth.user?.id) > 1 ? Number(auth.user?.id) - 1 : null,
            auth.user?.id
        ]

        return [...new Set(
            rawCandidates
                .map((candidate) => toNumber(candidate, null))
                .filter((candidate) => Number.isInteger(candidate) && candidate > 0)
        )]
    }

    function isRecoverableCartError(error) {
        const message = String(error?.message ?? '').toLowerCase()
        const cartValidationError = String(error?.errors?.cart_id?.[0] ?? '').toLowerCase()

        return (
            message.includes('not allowed to modify this cart') ||
            message.includes('could not create product') ||
            cartValidationError.includes('carrito') ||
            cartValidationError.includes('cart')
        )
    }

    function upsertLocalItem(productData, quantity) {
        const sanitizedQuantity = Math.max(1, toNumber(quantity, 1))
        const existingIndex = items.value.findIndex((item) => item.product_item_id === productData.product_item_id)

        if (existingIndex >= 0) {
            items.value[existingIndex] = {
                ...items.value[existingIndex],
                ...productData,
                quantity: sanitizedQuantity
            }
        } else {
            items.value.push({
                ...productData,
                quantity: sanitizedQuantity
            })
        }
    }

    async function syncAddOrUpdateItem(productItemId, quantity, preferredCandidates = []) {
        const candidates = [...new Set([...preferredCandidates, ...buildCartIdCandidates()])]
        let lastError = null

        for (const candidateCartId of candidates) {
            try {
                const response = await addProductToCartService({
                    cart_id: candidateCartId,
                    product_item_id: productItemId,
                    quantity
                })
                const backendCartItem = response?.['shopping cart item']

                cartId.value = toNumber(backendCartItem?.cart_id, candidateCartId)
                persistCartState()

                return
            } catch (error) {
                lastError = error
                if (!isRecoverableCartError(error)) {
                    throw error
                }
            }
        }

        throw lastError ?? new Error('No se pudo resolver el cart_id para este usuario.')
    }

    async function addProduct(product, quantityDelta = 1) {
        await initializeForSession()

        if (!auth.isAuthenticated) {
            throw new Error('Necesitas iniciar sesión para usar el carrito.')
        }

        const normalizedProduct = normalizeProductForCart(product)
        const existing = items.value.find((item) => item.product_item_id === normalizedProduct.product_item_id)
        const nextQuantity = Math.max(1, toNumber(existing?.quantity, 0) + Math.max(1, toNumber(quantityDelta, 1)))

        isSyncing.value = true
        try {
            await syncAddOrUpdateItem(normalizedProduct.product_item_id, nextQuantity)
            upsertLocalItem(normalizedProduct, nextQuantity)
            persistCartState()
        } finally {
            isSyncing.value = false
        }
    }

    async function setItemQuantity(productItemId, quantity) {
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
            await syncAddOrUpdateItem(normalizedItemId, nextQuantity)
            upsertLocalItem(existing, nextQuantity)
            persistCartState()
        } finally {
            isSyncing.value = false
        }
    }

    async function removeItem(productItemId) {
        await initializeForSession()

        const normalizedItemId = toNumber(productItemId, null)
        if (!normalizedItemId) return

        const candidates = buildCartIdCandidates()
        let lastError = null

        isSyncing.value = true
        try {
            for (const candidateCartId of candidates) {
                try {
                    await removeProductFromCartService(candidateCartId, normalizedItemId)
                    cartId.value = candidateCartId
                    items.value = items.value.filter((item) => item.product_item_id !== normalizedItemId)
                    persistCartState()
                    return
                } catch (error) {
                    lastError = error
                    if (!isRecoverableCartError(error)) {
                        throw error
                    }
                }
            }

            throw lastError ?? new Error('No se pudo eliminar el producto del carrito.')
        } finally {
            isSyncing.value = false
        }
    }

    function clearLocalCart() {
        if (!auth.isAuthenticated || !auth.user?.id) return

        localStorage.removeItem(getStorageKey(auth.user.id))
        resetRuntimeState()
    }

    return {
        cartId,
        items,
        itemCount,
        subtotal,
        hasItems,
        isSyncing,
        initializeForSession,
        fetchCartItems,
        addProduct,
        removeItem,
        setItemQuantity,
        clearLocalCart
    }
})
