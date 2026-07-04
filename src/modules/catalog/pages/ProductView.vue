<script setup>
import { useCartStore } from '@/modules/catalog/stores/cart'
import { useAuthStore } from '@/modules/identity/stores/auth'
import { api } from '@/modules/shared/infrastructure/http/api'
import { normalizeApiError } from '@/modules/shared/utils/normalizeApiError'
import {
  buildLensSeries,
  buildProductItemsByProductId,
  chooseRepresentativeProductItem,
  enrichProduct,
  getCategorySlug,
} from '@/modules/shared/utils/productApiAdapters'
import router from '@/router'
import { useToast } from 'primevue'
import Button from 'primevue/button'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const backendUrl = import.meta.env.VITE_BACKEND_BASE
const MICA_CATEGORY_ID = 1
const ARMAZON_CATEGORY_ID = 2

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()
const cart = useCartStore()

const productCode = route.params.code

const isLoading = ref(true)
const isAddingToCart = ref(false)
const product = ref({})
const baseProductImage = ref('')
const productItemsForProduct = ref([])
const lensProductItems = ref([])
const frameProductItems = ref([])
const productConfigurations = ref([])
const selectedFrameOptions = ref({})
const selectedLensSeriesQuantities = ref({})

const formatLensValue = (value) => {
  const numericValue = Number(value ?? 0)

  if (Object.is(numericValue, -0) || numericValue === 0) {
    return '0.00'
  }

  return numericValue.toFixed(2)
}

const productCategorySlug = computed(() =>
  getCategorySlug(
    product.value?.category?.name ?? product.value?.category_name ?? product.value?.category ?? '',
  ),
)
const isLensProduct = computed(
  () =>
    Number(product.value?.category_id) === MICA_CATEGORY_ID ||
    productCategorySlug.value === 'micas',
)
const isFrameProduct = computed(
  () =>
    Number(product.value?.category_id) === ARMAZON_CATEGORY_ID ||
    productCategorySlug.value === 'armazones',
)
const shouldShowProductCode = computed(() => {
  return !isLensProduct.value && !isFrameProduct.value && productCategorySlug.value !== 'micas'
})

const lensSeries = computed(() => buildLensSeries(lensProductItems.value, product.value?.image_url))
const hasLensSeries = computed(() => lensSeries.value.length > 0)

const parseStockValue = (value) => {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

const getProductItemStock = (item) => {
  if (!item) return 0

  const directStock = [
    item.stock,
    item.total_stock,
    item.available_stock,
    item.availability,
    item.existence,
  ]
    .map(parseStockValue)
    .find((value) => value !== null)

  if (directStock !== undefined) return Math.max(0, directStock)

  const inventoryRows = Array.isArray(item.inventory)
    ? item.inventory
    : Array.isArray(item.inventories)
      ? item.inventories
      : Array.isArray(item.inventory_items)
        ? item.inventory_items
        : []

  return inventoryRows.reduce((total, inventoryRow) => {
    const stock = parseStockValue(inventoryRow?.stock)

    return total + Math.max(0, stock ?? 0)
  }, 0)
}

const selectedStandardItem = computed(() => {
  if (isLensProduct.value || isFrameProduct.value) return null

  return (
    productItemsForProduct.value.find(
      (item) => Number(item?.id) === Number(product.value?.product_item_id),
    ) ??
    productItemsForProduct.value[0] ??
    null
  )
})

const selectedLensSeriesCartItems = computed(() => {
  if (!isLensProduct.value) return []

  return lensSeries.value
    .map((series) => {
      const quantity = Math.max(0, Number(selectedLensSeriesQuantities.value[series.key] ?? 0))

      if (quantity <= 0 || !series.representativeItem?.id) return null

      return {
        series,
        quantity,
      }
    })
    .filter(Boolean)
})

const selectedLensSeriesTotalQuantity = computed(() => {
  return selectedLensSeriesCartItems.value.reduce((total, entry) => total + entry.quantity, 0)
})

const selectedLensSeriesTotalPrice = computed(() => {
  return selectedLensSeriesCartItems.value.reduce(
    (total, entry) => total + entry.series.price * entry.quantity,
    0,
  )
})

const normalizeVariationName = (value) => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const normalizeFrameMetadata = (value) => {
  return normalizeVariationName(value).replace(/[^a-z0-9]+/g, ' ')
}

const getColorAliases = (value) => {
  const normalized = normalizeFrameMetadata(value)
  const aliasesByColor = {
    negro: ['negro', 'black'],
    plateado: ['plateado', 'plata', 'silver'],
    plata: ['plateado', 'plata', 'silver'],
    dorado: ['dorado', 'oro', 'gold'],
    transparente: ['transparente', 'cristal', 'clear'],
    azul: ['azul', 'blue'],
    rojo: ['rojo', 'red'],
    rosa: ['rosa', 'pink'],
    cafe: ['cafe', 'brown'],
    gris: ['gris', 'gray', 'grey'],
    verde: ['verde', 'green'],
  }

  return aliasesByColor[normalized] ?? [normalized]
}

const getFrameItemMetadataText = (item) => {
  return normalizeFrameMetadata(
    [item?.SKU, item?.product_image, item?.image_url].filter(Boolean).join(' '),
  )
}

function alignFrameColorOptionsWithItemImages(itemsById, variationsById) {
  const colorVariations = [...variationsById.values()].filter(
    (variation) => normalizeVariationName(variation.name) === 'color',
  )

  if (colorVariations.length === 0) return

  for (const item of Object.values(itemsById)) {
    const itemMetadata = getFrameItemMetadataText(item)

    if (!itemMetadata) continue

    for (const variation of colorVariations) {
      const matchedOption = variation.options.find((option) =>
        getColorAliases(option.value).some((alias) => itemMetadata.includes(alias)),
      )

      if (!matchedOption) continue

      const previousOptionId = item.optionsByVariationId?.[variation.id]

      if (previousOptionId) {
        item.optionIds.delete(previousOptionId)
      }

      item.optionIds.add(matchedOption.id)
      item.optionsByVariationId[variation.id] = matchedOption.id
    }
  }
}

const sortFrameVariations = (left, right) => {
  const order = {
    color: 1,
    material: 2,
  }

  const leftOrder = order[normalizeVariationName(left.name)] ?? 99
  const rightOrder = order[normalizeVariationName(right.name)] ?? 99

  if (leftOrder !== rightOrder) return leftOrder - rightOrder

  return String(left.name).localeCompare(String(right.name), 'es')
}

const frameVariantData = computed(() => {
  if (!isFrameProduct.value) {
    return {
      variations: [],
      items: [],
    }
  }

  const productId = Number(product.value?.id)
  const itemsById = frameProductItems.value.reduce((map, item) => {
    map[Number(item?.id)] = {
      ...item,
      optionIds: new Set(),
      optionsByVariationId: {},
    }

    return map
  }, {})
  const variationsById = new Map()

  for (const configuration of productConfigurations.value) {
    const item = configuration?.product_item
    const itemId = Number(configuration?.product_item_id ?? item?.id)
    const itemProductId = Number(item?.product_id ?? itemsById[itemId]?.product_id)

    if (itemProductId !== productId) continue

    if (!itemsById[itemId]) {
      itemsById[itemId] = {
        ...item,
        optionIds: new Set(),
        optionsByVariationId: {},
      }
    }

    const variationOption = configuration?.variation_option
    const variation = variationOption?.variation
    const variationId = Number(variation?.id ?? variationOption?.variation_id)
    const optionId = Number(variationOption?.id ?? configuration?.variation_option_id)

    if (!variationId || !optionId) continue

    const option = {
      id: optionId,
      value: variationOption?.value ?? `Opcion ${optionId}`,
      variationId,
    }

    if (!variationsById.has(variationId)) {
      variationsById.set(variationId, {
        id: variationId,
        name: variation?.name ?? `Variacion ${variationId}`,
        options: [],
      })
    }

    const variationRecord = variationsById.get(variationId)
    if (!variationRecord.options.some((existingOption) => existingOption.id === option.id)) {
      variationRecord.options.push(option)
    }

    itemsById[itemId].optionIds.add(optionId)
    itemsById[itemId].optionsByVariationId[variationId] = optionId
  }

  alignFrameColorOptionsWithItemImages(itemsById, variationsById)

  const variations = [...variationsById.values()]
    .map((variation) => ({
      ...variation,
      options: variation.options.sort((left, right) =>
        String(left.value).localeCompare(String(right.value), 'es'),
      ),
    }))
    .sort(sortFrameVariations)

  return {
    variations,
    items: Object.values(itemsById),
  }
})

const selectedFrameItem = computed(() => {
  if (!isFrameProduct.value) return null

  const selectedOptionIds = Object.values(selectedFrameOptions.value)
    .map((optionId) => Number(optionId))
    .filter(Boolean)

  if (selectedOptionIds.length === 0) {
    return frameVariantData.value.items[0] ?? null
  }

  return (
    frameVariantData.value.items.find((item) =>
      selectedOptionIds.every((optionId) => item.optionIds?.has(optionId)),
    ) ?? null
  )
})

const selectedFramePrice = computed(() => {
  const price = Number(selectedFrameItem.value?.price ?? product.value?.price ?? 0)

  return Number.isFinite(price) ? price : 0
})

const selectedFrameImage = computed(() => {
  if (!isFrameProduct.value) return ''

  return String(selectedFrameItem.value?.product_image ?? '').trim()
})

const displayProductImage = computed(() => {
  if (isFrameProduct.value && selectedFrameImage.value) {
    return selectedFrameImage.value
  }

  return baseProductImage.value || product.value?.image_url || ''
})

const selectedFrameVariationOptions = computed(() => {
  if (!isFrameProduct.value) return []

  return frameVariantData.value.variations
    .map((variation) => {
      const selectedOptionId = Number(selectedFrameOptions.value[variation.id])
      const selectedOption = variation.options.find(
        (option) => Number(option.id) === selectedOptionId,
      )

      if (!selectedOption) return null

      return {
        variation_id: variation.id,
        variation_name: variation.name,
        option_id: selectedOption.id,
        option_value: selectedOption.value,
      }
    })
    .filter(Boolean)
})

const purchaseAvailability = computed(() => {
  if (isLensProduct.value) {
    const selectedSeries = selectedLensSeriesCartItems.value
    const stock = selectedSeries.reduce((total, entry) => total + entry.series.totalStock, 0)

    if (!hasLensSeries.value) {
      return {
        isAvailable: false,
        stock: 0,
        label: 'No disponible',
        detail: 'Esta mica no tiene series disponibles.',
      }
    }

    if (selectedSeries.length === 0) {
      return {
        isAvailable: false,
        stock: 0,
        label: 'Selecciona una serie',
        detail: 'Elige la cantidad de al menos una serie para comprar.',
      }
    }

    const unavailableSeries = selectedSeries.filter((entry) => entry.series.totalStock <= 0)

    if (unavailableSeries.length > 0) {
      return {
        isAvailable: false,
        stock,
        label: 'No disponible',
        detail: `${unavailableSeries.length} series seleccionadas no tienen inventario.`,
      }
    }

    return {
      isAvailable: true,
      stock,
      label: 'Disponible',
      detail: `${selectedLensSeriesTotalQuantity.value} series seleccionadas.`,
    }
  }

  const selectedItem = isFrameProduct.value ? selectedFrameItem.value : selectedStandardItem.value
  const stock = getProductItemStock(selectedItem)

  return {
    isAvailable: stock > 0,
    stock,
    label: stock > 0 ? 'Disponible' : 'No disponible',
    detail:
      stock > 0 ? `${stock} unidades en inventario.` : 'Sin unidades disponibles en inventario.',
  }
})

const isAddToCartDisabled = computed(() => {
  if (isLensProduct.value) {
    return selectedLensSeriesCartItems.value.length === 0 || !purchaseAvailability.value.isAvailable
  }

  if (isFrameProduct.value) {
    return !selectedFrameItem.value?.id || !purchaseAvailability.value.isAvailable
  }

  return !product.value?.product_item_id || !purchaseAvailability.value.isAvailable
})

function setLensSeriesQuantity(seriesKey, quantity) {
  selectedLensSeriesQuantities.value = {
    ...selectedLensSeriesQuantities.value,
    [seriesKey]: Math.max(0, Number(quantity) || 0),
  }
}

function decreaseLensSeriesQuantity(seriesKey) {
  setLensSeriesQuantity(seriesKey, Number(selectedLensSeriesQuantities.value[seriesKey] ?? 0) - 1)
}

function increaseLensSeriesQuantity(seriesKey) {
  setLensSeriesQuantity(seriesKey, Number(selectedLensSeriesQuantities.value[seriesKey] ?? 0) + 1)
}

function initializeFrameSelectors() {
  if (!isFrameProduct.value || frameVariantData.value.variations.length === 0) return

  selectedFrameOptions.value = frameVariantData.value.variations.reduce((selection, variation) => {
    selection[variation.id] = variation.options[0]?.id ?? null

    return selection
  }, {})
}

function selectFrameOption(variationId, optionId) {
  const variation = frameVariantData.value.variations.find(
    (currentVariation) => Number(currentVariation.id) === Number(variationId),
  )

  if (variation?.options.length === 1) return

  selectedFrameOptions.value = {
    ...selectedFrameOptions.value,
    [variationId]: optionId,
  }
}

function isFrameOptionAvailable(variationId, optionId) {
  const selectedEntries = Object.entries(selectedFrameOptions.value)
    .filter(
      ([currentVariationId, currentOptionId]) =>
        Number(currentVariationId) !== Number(variationId) && Number(currentOptionId),
    )
    .map(([, currentOptionId]) => Number(currentOptionId))

  return frameVariantData.value.items.some(
    (item) =>
      item.optionIds?.has(Number(optionId)) &&
      selectedEntries.every((selectedOptionId) => item.optionIds?.has(selectedOptionId)),
  )
}

watch(
  frameVariantData,
  (variantData) => {
    if (!isFrameProduct.value || variantData.variations.length === 0) return

    const hasSelection = variantData.variations.every(
      (variation) => selectedFrameOptions.value[variation.id],
    )

    if (!hasSelection) {
      initializeFrameSelectors()
    }
  },
  { immediate: true },
)

watch(
  selectedFrameItem,
  (item) => {
    if (!isFrameProduct.value) return

    const nextProductItemId = item?.id ?? null
    const nextCode = item?.SKU ?? product.value.code
    const nextPrice = item?.price ?? product.value.price
    const nextStock = getProductItemStock(item)
    const nextImageUrl = item?.product_image || baseProductImage.value || product.value.image_url
    const nextVariationOptions = selectedFrameVariationOptions.value

    if (
      product.value?.product_item_id === nextProductItemId &&
      product.value?.code === nextCode &&
      product.value?.price === nextPrice &&
      product.value?.stock === nextStock &&
      product.value?.image_url === nextImageUrl &&
      JSON.stringify(product.value?.variation_options ?? []) ===
        JSON.stringify(nextVariationOptions)
    ) {
      return
    }

    product.value = {
      ...product.value,
      product_item_id: nextProductItemId,
      code: nextCode,
      SKU: nextCode,
      price: nextPrice,
      image_url: nextImageUrl,
      stock: nextStock,
      variation_options: nextVariationOptions,
    }
  },
  { immediate: true },
)

// Format the price of the product (commas)
const formatPrice = (price) => {
  const numericPrice = Number(price ?? 0)

  if (!Number.isFinite(numericPrice)) {
    return '0.00'
  }

  return numericPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Get the product associated with the ID
onMounted(async () => {
  try {
    if (cart.canUseCart) {
      await cart.initializeForSession()
    }

    const [productResponse, productItemsResponse, productConfigurationsResponse] =
      await Promise.all([
        api.get(`products/${productCode}`),
        api.get('product-items'),
        api.get('product-configurations').catch(() => ({ data: [] })),
      ])
    const productItems = Array.isArray(productItemsResponse.data) ? productItemsResponse.data : []
    const productItemsByProductId = buildProductItemsByProductId(productItemsResponse.data)
    const enrichedProduct = enrichProduct(productResponse.data, productItemsByProductId)
    productConfigurations.value = Array.isArray(productConfigurationsResponse.data)
      ? productConfigurationsResponse.data
      : []
    productItemsForProduct.value = productItems.filter(
      (item) => Number(item?.product_id) === Number(enrichedProduct?.id),
    )
    const primaryProductItem = chooseRepresentativeProductItem(productItemsForProduct.value)
    baseProductImage.value = enrichedProduct.image_url ?? ''

    product.value = {
      ...enrichedProduct,
      product_item_id: primaryProductItem?.id ?? enrichedProduct.product_item_id,
      code: primaryProductItem?.SKU ?? enrichedProduct.code,
      SKU: primaryProductItem?.SKU ?? enrichedProduct.SKU,
      price: primaryProductItem?.price ?? enrichedProduct.price,
      image_url: enrichedProduct.image_url,
      stock: getProductItemStock(primaryProductItem),
    }
    lensProductItems.value = productItemsForProduct.value
    frameProductItems.value = productItemsForProduct.value

    if (isFrameProduct.value) {
      initializeFrameSelectors()
    }

    isLoading.value = false
  } catch (error) {
    const apiError = normalizeApiError(error)
    const detail =
      apiError === 'Error inesperado'
        ? 'No se pudo obtener el producto'
        : `No se pudo obtener el producto: ${apiError}`

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail,
      life: 4000,
    })
  }
})

const addToCart = async () => {
  if (!auth.isAuthenticated || !cart.canUseCart) {
    toast.add({
      severity: 'warn',
      summary: 'Inicia sesión',
      detail: auth.isAdmin
        ? 'El carrito solo esta disponible para usuarios compradores.'
        : 'Debes iniciar sesión para agregar productos al carrito.',
      life: 4000,
    })
    if (!auth.isAuthenticated) {
      router.push({ name: 'login' })
    }
    return
  }

  if (!product.value?.product_item_id) {
    toast.add({
      severity: 'error',
      summary: 'No disponible',
      detail: 'Este producto no tiene item de inventario asociado para carrito.',
      life: 4500,
    })
    return
  }

  if (!purchaseAvailability.value.isAvailable) {
    toast.add({
      severity: 'warn',
      summary: 'No disponible',
      detail: 'Este producto no tiene disponibilidad suficiente para comprar.',
      life: 4500,
    })
    return
  }

  try {
    isAddingToCart.value = true

    if (isLensProduct.value) {
      for (const entry of selectedLensSeriesCartItems.value) {
        const item = entry.series.representativeItem

        await cart.addProduct(
          {
            ...product.value,
            product_item_id: item.id,
            code: item.SKU ?? product.value.code,
            SKU: item.SKU ?? product.value.code,
            name: `${product.value.name} - ${entry.series.label}`,
            price: entry.series.price,
            image_url: entry.series.image_url || product.value.image_url,
            stock: entry.series.totalStock,
          },
          entry.quantity,
        )
      }

      toast.add({
        severity: 'success',
        summary: 'Agregado',
        detail: `${selectedLensSeriesTotalQuantity.value} series agregadas al carrito.`,
        life: 3000,
      })

      return
    }

    await cart.addProduct(product.value, 1)

    toast.add({
      severity: 'success',
      summary: 'Agregado',
      detail: 'Producto agregado al carrito.',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error?.message ?? 'No se pudo agregar el producto al carrito.',
      life: 4500,
    })
  } finally {
    isAddingToCart.value = false
  }
}

const editProduct = () => {
  router.push({
    name: 'admin-products-modify-form',
    params: {
      code: product.value?.id ?? productCode,
    },
  })
}
</script>

<template>
  <!-- Loading screen -->
  <div v-if="isLoading" class="flex flex-col mx-auto my-auto items-center gap-y-8 mt-24">
    <div
      class="text-sky-800 pi pi-spinner-dotted animate-spin slow-spin"
      style="font-size: 8rem"
    ></div>
    <div class="lg:text-5xl text-4xl text-sky-800 font-bold">Cargando...</div>
  </div>

  <!-- Content -->
  <div
    v-else
    class="flex flex-col items-center lg:px-20 px-8 mt-14 lg:gap-y-8 gap-y-6 2xl:mb-8 mb-12"
  >
    <!-- Grouped left-aligned section -->
    <div class="flex flex-col items-start gap-y-6">
      <!-- Product details text -->
      <div class="font-semibold text-2xl text-sky-800">Detalles del producto</div>

      <!-- Product image and details -->
      <div class="flex lg:flex-row flex-col justify-center lg:gap-x-20 gap-y-8">
        <!-- Product image -->
        <img
          :src="`${backendUrl}/storage/${displayProductImage}`"
          alt="Imagen del producto"
          class="size-72 max-w-full object-contain object-center bg-white md:size-96 lg:size-[28rem] border-solid border-2 border-sky-600 rounded-lg shadow-xl"
        />

        <!-- Product details -->
        <div class="flex flex-col justify-center gap-y-5 lg:min-w-[24rem] max-w-lg">
          <!-- Product name -->
          <div class="font-semibold text-3xl text-sky-800">
            {{ product.name }}
          </div>

          <!-- Product price -->
          <div
            v-if="!isLensProduct && !isFrameProduct && product.price !== null"
            class="font-bold text-3xl text-sky-800"
          >
            {{ '$' + formatPrice(product.price) }}
          </div>
          <div
            v-else-if="!isLensProduct && !isFrameProduct"
            class="font-semibold text-lg text-slate-600"
          >
            Precio no disponible
          </div>

          <!-- Product code -->
          <div v-if="shouldShowProductCode" class="flex flex-row gap-x-2">
            <div class="font-semibold text-sky-800">Codigo:</div>
            <div class="font-semibold text-sky-800">
              {{ product.code }}
            </div>
          </div>

          <!-- Description -->
          <div v-if="!isFrameProduct" class="flex flex-col gap-y-2">
            <div class="font-semibold text-lg text-sky-800">Descripción</div>
            <div class="text-justify font-medium text-slate-600 max-w-md">
              {{ product.description }}
            </div>
          </div>

          <div v-if="isFrameProduct" class="flex flex-col gap-7">
            <div
              v-for="variation in frameVariantData.variations"
              :key="variation.id"
              class="flex flex-col gap-4"
            >
              <div class="font-semibold text-sky-800">{{ variation.name }}:</div>
              <div class="flex flex-wrap gap-x-8 gap-y-3">
                <label
                  v-for="option in variation.options"
                  :key="option.id"
                  :class="[
                    isFrameOptionAvailable(variation.id, option.id)
                      ? 'cursor-pointer text-slate-600'
                      : 'cursor-not-allowed text-slate-400',
                    'inline-flex items-center gap-3 font-semibold',
                  ]"
                >
                  <input
                    type="checkbox"
                    class="h-5 w-5 rounded border-slate-300 text-sky-800 focus:ring-sky-500"
                    :checked="Number(selectedFrameOptions[variation.id]) === Number(option.id)"
                    :disabled="
                      variation.options.length === 1 ||
                      !isFrameOptionAvailable(variation.id, option.id)
                    "
                    @change="selectFrameOption(variation.id, option.id)"
                  />
                  <span>{{ option.value }}</span>
                </label>
              </div>
            </div>

            <div class="flex flex-wrap items-baseline gap-x-2 font-semibold text-xl text-slate-600">
              Precio:
              <span class="font-bold text-3xl text-sky-800"
                >${{ formatPrice(selectedFramePrice) }} MXN</span
              >
            </div>
          </div>

          <div
            v-if="isLensProduct && hasLensSeries"
            class="mt-2 flex flex-col gap-5 rounded-xl border border-sky-100 bg-sky-50/80 p-5"
          >
            <div class="flex flex-col gap-1">
              <div class="font-semibold text-lg text-sky-800">Series disponibles</div>
              <div class="text-sm text-slate-600">
                Selecciona las series que quieres agregar a tu pedido.
              </div>
            </div>

            <div class="grid gap-3">
              <div
                v-for="series in lensSeries"
                :key="series.key"
                class="rounded-xl border border-sky-100 bg-white p-4"
              >
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img
                    :src="`${backendUrl}/storage/${series.image_url || product.image_url}`"
                    :alt="series.label"
                    class="h-24 w-24 shrink-0 rounded-lg border border-slate-200 bg-white object-contain object-center"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div class="font-bold text-sky-800">{{ series.label }}</div>
                        <div class="text-sm font-medium text-slate-600">
                          {{ series.items.length }} combinaciones
                        </div>
                      </div>
                      <div class="text-xl font-bold text-sky-800">
                        ${{ formatPrice(series.price) }}
                      </div>
                    </div>
                    <div class="mt-2 text-sm font-medium text-slate-600">
                      Esfera {{ formatLensValue(series.sphereMin) }} a
                      {{ formatLensValue(series.sphereMax) }}
                    </div>
                    <div class="text-sm font-medium text-slate-600">
                      Cilindro {{ formatLensValue(series.cylinderMax) }} a
                      {{ formatLensValue(series.cylinderMin) }}
                    </div>
                    <div class="mt-1 text-sm font-semibold text-emerald-700">
                      Stock total: {{ series.totalStock }}
                    </div>
                  </div>
                  <div class="grid w-full grid-cols-[40px_1fr_40px] gap-2 sm:w-36">
                    <button
                      type="button"
                      class="rounded-lg bg-sky-700 text-lg font-bold text-white transition hover:bg-sky-800"
                      @click="decreaseLensSeriesQuantity(series.key)"
                    >
                      -
                    </button>
                    <input
                      :value="selectedLensSeriesQuantities[series.key] ?? 0"
                      type="number"
                      min="0"
                      class="min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-center font-bold text-sky-800"
                      @input="setLensSeriesQuantity(series.key, $event.target.value)"
                    />
                    <button
                      type="button"
                      class="rounded-lg bg-sky-700 text-lg font-bold text-white transition hover:bg-sky-800"
                      @click="increaseLensSeriesQuantity(series.key)"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-xl border-2 border-slate-500 bg-white px-5 py-4">
              <div class="flex items-center justify-between gap-4 text-lg text-slate-600">
                <span>Series seleccionadas:</span>
                <span class="font-semibold text-slate-600">{{
                  selectedLensSeriesTotalQuantity
                }}</span>
              </div>
              <div class="mt-2 flex items-center justify-between gap-4 text-xl text-slate-600">
                <span>Total estimado:</span>
                <span class="font-bold text-3xl text-sky-800"
                  >${{ formatPrice(selectedLensSeriesTotalPrice) }}</span
                >
              </div>
            </div>
          </div>

          <div
            :class="[
              purchaseAvailability.isAvailable
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700',
              'mt-2 rounded-xl border px-5 py-4 font-semibold',
            ]"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span>Disponibilidad</span>
              <span>{{ purchaseAvailability.label }}</span>
            </div>
            <div class="mt-1 text-sm font-medium">
              {{ purchaseAvailability.detail }}
            </div>
          </div>

          <Button
            v-if="cart.canUseCart || !auth.isAuthenticated"
            label="Agregar al carrito"
            icon="pi pi-shopping-cart"
            class="!bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800 mt-3"
            :loading="isAddingToCart"
            :disabled="isAddToCartDisabled"
            @click="addToCart"
          />
          <Button
            v-if="auth.isAdmin"
            label="Editar producto"
            icon="pi pi-pencil"
            class="!bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800 mt-3"
            @click="editProduct"
          />
        </div>
      </div>
    </div>
  </div>

  <Toast position="bottom-right" />
</template>
