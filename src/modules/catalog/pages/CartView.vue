<script setup>
import { useCartStore } from '@/contexts/catalog/stores/cart'
import { getUserAddressesService } from '@/contexts/identity/services/profileService'
import { useAuthStore } from '@/contexts/identity/stores/auth'
import { formatPrice } from '@/modules/shared/utils/formatPrice'
import router from '@/router'
import { useToast } from 'primevue'
import Button from 'primevue/button'
import { computed, onMounted, ref } from 'vue'

const backendUrl = import.meta.env.VITE_BACKEND_BASE

const toast = useToast()
const auth = useAuthStore()
const cart = useCartStore()
const MICA_CATEGORY_ID = 1
const ARMAZON_CATEGORY_ID = 2

const isLoading = ref(true)
const addresses = ref([])

const shippingCost = computed(() => 0)
const subtotal = computed(() => cart.subtotal)
const total = computed(() => subtotal.value + shippingCost.value)
const itemRows = computed(() => cart.items)

const defaultAddress = computed(() => {
  if (!addresses.value.length) return null

  return addresses.value.find((address) => address.is_default) ?? addresses.value[0]
})

const addressLine = computed(() => {
  if (!defaultAddress.value) return 'No hay dirección principal configurada.'

  return `Calle ${defaultAddress.value.street} #${defaultAddress.value.external_number}, Colonia ${defaultAddress.value.district}`
})

const addressLocation = computed(() => {
  if (!defaultAddress.value) return 'Configura una dirección en tu perfil.'

  const city =
    Number(defaultAddress.value.city_id) === 1
      ? 'San Francisco de Campeche'
      : `Ciudad #${defaultAddress.value.city_id}`

  return `${city}, México`
})

const addressMapUrl = computed(() => {
  if (!defaultAddress.value)
    return 'https://maps.google.com/maps?q=Campeche,Mexico&z=14&hl=es&output=embed'

  const query = [
    defaultAddress.value.street,
    `#${defaultAddress.value.external_number}`,
    defaultAddress.value.district,
    addressLocation.value,
  ].join(' ')

  return `https://maps.google.com/maps?${new URLSearchParams({
    q: query,
    z: '17',
    hl: 'es',
    output: 'embed',
  }).toString()}`
})

function getImageSrc(item) {
  if (!item?.image_url) return ''
  if (String(item.image_url).startsWith('http')) return item.image_url

  return `${backendUrl}/storage/${item.image_url}`
}

function stockStatus(item) {
  const stock = Number(item?.stock ?? 0)

  if (stock <= 0) {
    return {
      label: 'No disponible',
      className: 'bg-red-600 text-white',
    }
  }

  return {
    label: `Disponible: ${stock}`,
    className: 'bg-emerald-100 text-emerald-700',
  }
}

function formatLensValue(value) {
  const numericValue = Number(value ?? 0)

  if (!Number.isFinite(numericValue) || Object.is(numericValue, -0) || numericValue === 0) {
    return '0.00'
  }

  return numericValue.toFixed(2)
}

function parseLensSku(sku) {
  const normalizedSku = String(sku ?? '')
    .trim()
    .toUpperCase()
  const match = normalizedSku.match(/-S([NP]?)(\d{3})-CN(\d{3})$/)

  if (!match) return null

  const spherePrefix = match[1]
  const sphereMagnitude = Number(match[2]) / 100
  const cylinderMagnitude = Number(match[3]) / 100

  let sphere = 0

  if (spherePrefix === 'N') {
    sphere = -sphereMagnitude
  } else if (spherePrefix === 'P') {
    sphere = sphereMagnitude
  }

  return {
    sphere: Number(sphere.toFixed(2)),
    cylinder: Number((-cylinderMagnitude).toFixed(2)),
  }
}

function isLensItem(item) {
  return Number(item?.category_id) === MICA_CATEGORY_ID
}

function getLensDetails(item) {
  if (!isLensItem(item)) return null

  return parseLensSku(item?.sku ?? item?.code)
}

function getVariationDetails(item) {
  if (Number(item?.category_id) !== ARMAZON_CATEGORY_ID) return []
  if (!Array.isArray(item?.variation_options)) return []

  return item.variation_options.filter(
    (variationOption) => variationOption?.variation_name && variationOption?.option_value,
  )
}

function getDisplayCode(item) {
  return item?.sku || item?.code || item?.product_item_id
}

async function loadDeliveryAddresses() {
  if (!auth.user?.id) return

  try {
    const response = await getUserAddressesService(auth.user.id)
    const list = Array.isArray(response?.addresses) ? response.addresses : []
    addresses.value = list.map((address) => ({
      ...address,
      is_default:
        address?.is_default === true || address?.is_default === 1 || address?.is_default === '1',
    }))
  } catch (error) {
    toast.add({
      severity: 'warn',
      summary: 'Dirección',
      detail: 'No se pudieron cargar las direcciones de entrega.',
      life: 3500,
    })
  }
}

async function increaseQuantity(item) {
  try {
    await cart.setItemQuantity(item.product_item_id, Number(item.quantity) + 1)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error?.message ?? 'No se pudo aumentar la cantidad.',
      life: 4000,
    })
  }
}

async function decreaseQuantity(item) {
  const next = Number(item.quantity) - 1

  try {
    if (next <= 0) {
      await removeItem(item)
      return
    }

    await cart.setItemQuantity(item.product_item_id, next)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error?.message ?? 'No se pudo reducir la cantidad.',
      life: 4000,
    })
  }
}

async function removeItem(item) {
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
      detail: error?.message ?? 'No se pudo eliminar el producto.',
      life: 4000,
    })
  }
}

const goToProfile = () => router.push({ name: 'profile' })
const goToShop = () => router.push({ name: 'shop' })

onMounted(async () => {
  try {
    await cart.initializeForSession({ forceRemote: true })
    await loadDeliveryAddresses()
  } catch (error) {
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
</script>

<template>
  <div v-if="isLoading" class="flex flex-col mx-auto my-auto items-center gap-y-8 mt-24">
    <div
      class="text-sky-600 pi pi-spinner-dotted animate-spin slow-spin"
      style="font-size: 8rem"
    ></div>
    <div class="lg:text-5xl text-4xl text-sky-700 font-bold">Cargando...</div>
  </div>

  <div v-else class="xl:px-20 md:px-12 px-8 lg:mt-14 md:py-10 py-8 flex flex-col gap-8">
    <h1 class="text-4xl md:text-5xl font-bold text-sky-800">Carrito de compras</h1>

    <div
      v-if="!cart.hasItems"
      class="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 flex flex-col gap-6 items-start"
    >
      <div class="text-2xl font-semibold text-sky-800">Tu carrito está vacío</div>
      <p class="text-slate-600 max-w-2xl">
        Aún no has agregado productos. Explora el catálogo para seleccionar equipos, micas o
        armazones.
      </p>
      <Button
        label="Ir a la tienda"
        icon="pi pi-shopping-bag"
        class="!bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800"
        @click="goToShop"
      />
    </div>

    <div v-else class="grid xl:grid-cols-[1.65fr_1fr] grid-cols-1 gap-6">
      <section class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-2xl font-semibold text-sky-800">Productos</h2>
          <span class="text-slate-600 font-medium">Total: {{ cart.itemCount }} unidades</span>
        </div>

        <div class="flex flex-col divide-y divide-slate-200">
          <article
            v-for="item in itemRows"
            :key="item.product_item_id"
            class="py-5 grid md:grid-cols-[7.5rem_1fr_auto] gap-4"
          >
            <img
              :src="getImageSrc(item)"
              alt="Producto del carrito"
              class="w-[7.5rem] h-[7.5rem] object-contain object-center rounded-xl border border-slate-200 bg-white"
            />

            <div class="flex flex-col gap-2">
              <div class="text-xl font-semibold text-sky-800">{{ item.name }}</div>
              <div class="text-slate-600 text-sm leading-relaxed line-clamp-2">
                {{ item.description || 'Sin descripción disponible.' }}
              </div>

              <div
                v-if="getLensDetails(item)"
                class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600"
              >
                <span>
                  <span class="font-semibold text-sky-800">Esfera:</span>
                  {{ formatLensValue(getLensDetails(item).sphere) }}
                </span>
                <span>
                  <span class="font-semibold text-sky-800">Cilindro:</span>
                  {{ formatLensValue(getLensDetails(item).cylinder) }}
                </span>
              </div>

              <div
                v-if="getVariationDetails(item).length > 0"
                class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600"
              >
                <span
                  v-for="variationOption in getVariationDetails(item)"
                  :key="`${item.product_item_id}-${variationOption.variation_id}-${variationOption.option_id}`"
                >
                  <span class="font-semibold text-sky-800"
                    >{{ variationOption.variation_name }}:</span
                  >
                  {{ variationOption.option_value }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-3 mt-1">
                <span
                  :class="[
                    'text-xs font-semibold px-3 py-1 rounded-full',
                    stockStatus(item).className,
                  ]"
                >
                  {{ stockStatus(item).label }}
                </span>
                <span class="text-sm text-slate-600">Código: {{ getDisplayCode(item) }}</span>
              </div>

              <div class="flex items-center gap-2 mt-2">
                <Button
                  icon="pi pi-minus"
                  text
                  rounded
                  class="!w-8 !h-8 !border !border-sky-800 !text-sky-800"
                  :disabled="cart.isSyncing || Number(item.stock ?? 0) <= 0"
                  @click="decreaseQuantity(item)"
                />
                <span class="font-semibold text-slate-600 min-w-8 text-center">{{
                  item.quantity
                }}</span>
                <Button
                  icon="pi pi-plus"
                  text
                  rounded
                  class="!w-8 !h-8 !border !border-sky-800 !text-sky-800"
                  :disabled="cart.isSyncing || Number(item.stock ?? 0) <= Number(item.quantity)"
                  @click="increaseQuantity(item)"
                />
              </div>
            </div>

            <div class="flex flex-col items-end justify-between gap-4">
              <div class="font-bold text-3xl text-sky-800 whitespace-nowrap">
                ${{ formatPrice(Number(item.price) * Number(item.quantity)) }} MXN
              </div>
              <Button
                label="Eliminar"
                icon="pi pi-trash"
                text
                severity="danger"
                class="!text-red-600"
                :disabled="cart.isSyncing"
                @click="removeItem(item)"
              />
            </div>
          </article>
        </div>
      </section>

      <aside class="flex flex-col gap-6">
        <section class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-2xl font-semibold text-sky-800">Entrega</h3>
            <Button
              label="Editar"
              icon="pi pi-pen-to-square"
              text
              class="!text-sky-800"
              @click="goToProfile"
            />
          </div>
          <div class="text-slate-600 font-semibold">{{ addressLine }}</div>
          <div class="text-slate-600 mb-4">{{ addressLocation }}</div>

          <iframe
            :src="addressMapUrl"
            title="Mapa de entrega"
            class="w-full h-[170px] rounded-xl border border-slate-200"
            loading="lazy"
            referrerpolicy="no-referrer"
          ></iframe>
        </section>

        <section class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6">
          <h3 class="text-2xl font-semibold text-sky-800 mb-4">Orden</h3>

          <div class="flex justify-between text-slate-600 py-2">
            <span>Productos</span>
            <span class="font-bold text-xl text-sky-800">${{ formatPrice(subtotal) }} MXN</span>
          </div>
          <div class="flex justify-between text-slate-600 py-2">
            <span>Envío</span>
            <span class="font-semibold">Gratis</span>
          </div>

          <div class="border-t border-slate-300 my-3"></div>

          <div class="flex justify-between items-center text-slate-600 py-2">
            <span class="text-2xl font-bold">TOTAL</span>
            <span class="text-4xl font-bold text-sky-800">${{ formatPrice(total) }} MXN</span>
          </div>

          <Button
            label="Pagar ahora"
            class="w-full mt-4 !bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800 !text-xl !font-semibold"
          />
        </section>
      </aside>
    </div>
  </div>

  <Toast position="bottom-right" />
</template>
