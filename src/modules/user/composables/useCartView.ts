import { useToast } from 'primevue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import type { Address } from '@/modules/user/interfaces/Address'
import type { CartItem } from '@/modules/user/interfaces/Cart'
import { getUserAddressesService } from '@/modules/user/services/profileService'
import { useCartStore } from '@/modules/user/stores/cart'
import { extractAddressList, normalizeAddress, sortAddresses } from '@/modules/user/utils/address'

import { mapFallbackThumbnail, useAddressMapThumbnails } from './useAddressMapThumbnails'
import { useCityCatalog } from './useCityCatalog'

export function useCartView() {
  const toast = useToast()
  const router = useRouter()
  const cart = useCartStore()

  const cityCatalog = useCityCatalog()
  const mapThumbnails = useAddressMapThumbnails(cityCatalog)

  const isLoading = ref(true)
  const defaultAddress = ref<Address | null>(null)

  const itemRows = computed(() => cart.items)
  const shippingCost = computed(() => 0)
  const subtotal = computed(() => cart.subtotal)
  const total = computed(() => subtotal.value + shippingCost.value)

  const addressLocation = computed(() =>
    defaultAddress.value
      ? cityCatalog.formatAddressLocation(defaultAddress.value)
      : 'Configura una dirección en tu perfil.',
  )

  const addressMapUrl = computed(() =>
    defaultAddress.value
      ? mapThumbnails.getAddressMapThumbnail(defaultAddress.value)
      : mapFallbackThumbnail,
  )

  async function loadDefaultAddress() {
    try {
      const response = await getUserAddressesService()
      const addresses = sortAddresses(extractAddressList(response).map(normalizeAddress))

      defaultAddress.value = addresses[0] ?? null

      if (defaultAddress.value) {
        cityCatalog.mergeCityOption(defaultAddress.value.city_id)
        await mapThumbnails.loadAddressMapThumbnails([defaultAddress.value])
      }
    } catch {
      toast.add({
        severity: 'warn',
        summary: 'Dirección',
        detail: 'No se pudieron cargar las direcciones de entrega.',
        life: 3500,
      })
    }
  }

  async function increaseQuantity(item: CartItem) {
    try {
      await cart.setItemQuantity(item.product_item_id, item.quantity + 1)
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'No se pudo aumentar la cantidad.',
        life: 4000,
      })
    }
  }

  async function decreaseQuantity(item: CartItem) {
    try {
      await cart.setItemQuantity(item.product_item_id, item.quantity - 1)
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'No se pudo reducir la cantidad.',
        life: 4000,
      })
    }
  }

  async function removeItem(item: CartItem) {
    try {
      await cart.removeItem(item.product_item_id)
      toast.add({
        severity: 'success',
        summary: 'Eliminado',
        detail: 'Producto removido del carrito.',
        life: 2800,
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'No se pudo eliminar el producto.',
        life: 4000,
      })
    }
  }

  const goToProfile = () => router.push({ name: 'profile' })
  const goToShop = () => router.push({ name: 'shop' })

  onMounted(async () => {
    try {
      await cart.initializeForSession({ forceRemote: true })
      await loadDefaultAddress()
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el carrito.',
        life: 4000,
      })
    } finally {
      isLoading.value = false
    }
  })

  return {
    isLoading,
    itemRows,
    shippingCost,
    subtotal,
    total,
    hasItems: computed(() => cart.hasItems),
    itemCount: computed(() => cart.itemCount),
    isSyncing: computed(() => cart.isSyncing),
    defaultAddress,
    addressLine: computed(() =>
      defaultAddress.value
        ? `Calle ${defaultAddress.value.street} #${defaultAddress.value.external_number}, Colonia ${defaultAddress.value.district}`
        : 'No hay dirección principal configurada.',
    ),
    addressLocation,
    addressMapUrl,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    goToProfile,
    goToShop,
  }
}
