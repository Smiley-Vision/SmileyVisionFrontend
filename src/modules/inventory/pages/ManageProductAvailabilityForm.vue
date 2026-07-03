<script setup>
import { api } from '@/modules/shared/infrastructure/http/api'
import { buildLensSeries, getCategorySlug } from '@/modules/shared/utils/productApiAdapters'
import { useToast } from 'primevue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const backendUrl = import.meta.env.VITE_BACKEND_BASE

const route = useRoute()
const toast = useToast()

const isLoading = ref(true)
const isSubmitting = ref(false)
const product = ref({})
const productItems = ref([])
const productConfigurations = ref([])
const selectedProductItemId = ref(null)
const selectedLensSeriesKey = ref(null)
const selectedOfficeID = ref('')
const productStock = ref(0)
const initialStock = ref(0)
const branchOffices = ref([
  { id: 1, name: 'Smiley Mexico 1' },
  { id: 2, name: 'Smiley Mexico 2' },
  { id: 3, name: 'Smiley Merida' },
  { id: 4, name: 'Smiley Campeche' },
])
const MICA_CATEGORY_ID = 1
const ARMAZON_CATEGORY_ID = 2

const productCode = route.params.code

const selectedProductItem = computed(() => {
  return (
    productItems.value.find((item) => Number(item.id) === Number(selectedProductItemId.value)) ??
    null
  )
})

const productCategorySlug = computed(() => {
  const slug = getCategorySlug(
    product.value?.category?.name ?? product.value?.category_name ?? product.value?.category ?? '',
  )

  if (slug) return slug
  if (Number(product.value?.category_id) === MICA_CATEGORY_ID) return 'micas'
  if (Number(product.value?.category_id) === ARMAZON_CATEGORY_ID) return 'armazones'

  return ''
})

const hasProductItems = computed(() => productItems.value.length > 0)
const isLensProduct = computed(() => productCategorySlug.value === 'micas')
const lensSeries = computed(() =>
  buildLensSeries(
    productItems.value,
    product.value?.image_url ?? product.value?.product_image ?? '',
  ),
)
const selectedLensSeries = computed(() => {
  return lensSeries.value.find((series) => series.key === selectedLensSeriesKey.value) ?? null
})

const selectedOfficeName = computed(() => {
  return (
    branchOffices.value.find((office) => Number(office.id) === Number(selectedOfficeID.value))
      ?.name ?? ''
  )
})

const totalStock = computed(() => {
  if (isLensProduct.value) {
    return lensSeries.value.reduce((total, series) => total + series.totalStock, 0)
  }

  return productItems.value.reduce((total, item) => total + getItemTotalStock(item), 0)
})

const selectedItemTotalStock = computed(() => {
  if (isLensProduct.value) return selectedLensSeries.value?.totalStock ?? 0

  return getItemTotalStock(selectedProductItem.value)
})

const isStockModified = computed(() => {
  return Number(productStock.value) !== Number(initialStock.value)
})

const stockDelta = computed(() => Number(productStock.value) - Number(initialStock.value))

const selectedItemImageSrc = computed(() => {
  const imagePath = isLensProduct.value
    ? selectedLensSeries.value?.image_url ||
      product.value?.image_url ||
      product.value?.product_image
    : (product.value?.image_url ?? product.value?.product_image)

  return imagePath ? `${backendUrl}/storage/${imagePath}` : ''
})

function parseStock(value) {
  const stock = Number(value)

  return Number.isFinite(stock) ? stock : 0
}

function getItemInventoryRows(item) {
  if (Array.isArray(item?.inventory)) return item.inventory
  if (Array.isArray(item?.inventories)) return item.inventories

  return []
}

function getItemOfficeStock(item, officeId) {
  if (!item || !officeId) return 0

  const inventoryRow = getItemInventoryRows(item).find(
    (row) => Number(row?.branch_office_id) === Number(officeId),
  )

  return parseStock(inventoryRow?.stock)
}

function getItemTotalStock(item) {
  return getItemInventoryRows(item).reduce((total, row) => total + parseStock(row?.stock), 0)
}

function normalizeVariationName(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function getFrameVariationDetails(item) {
  const itemConfigurations = productConfigurations.value.filter(
    (configuration) => Number(configuration?.product_item_id) === Number(item?.id),
  )

  return itemConfigurations
    .map((configuration) => {
      const option = configuration?.variation_option
      const variation = option?.variation

      if (!option || !variation) return null

      return {
        variationName: variation.name,
        optionValue: option.value,
      }
    })
    .filter(Boolean)
    .sort((left, right) => {
      const order = { color: 1, material: 2 }

      return (
        (order[normalizeVariationName(left.variationName)] ?? 99) -
        (order[normalizeVariationName(right.variationName)] ?? 99)
      )
    })
}

function parseLensSku(sku) {
  const normalizedSku = String(sku ?? '')
    .trim()
    .toUpperCase()
  const match = normalizedSku.match(/-S([NP]?)(\d{3})-C(N?)(\d{3})$/)

  if (!match) return null

  const spherePrefix = match[1]
  const sphereMagnitude = Number(match[2]) / 100
  const cylinderPrefix = match[3]
  const cylinderMagnitude = Number(match[4]) / 100

  return {
    sphere: spherePrefix === 'N' ? -sphereMagnitude : spherePrefix === 'P' ? sphereMagnitude : 0,
    cylinder: cylinderPrefix === 'N' ? -cylinderMagnitude : cylinderMagnitude,
  }
}

function formatLensValue(value) {
  const number = Number(value ?? 0)

  return number === 0 || Object.is(number, -0) ? '0.00' : number.toFixed(2)
}

function getItemSubtitle(item) {
  if (productCategorySlug.value === 'armazones') {
    const details = getFrameVariationDetails(item)

    return details.length > 0
      ? details.map((detail) => `${detail.variationName}: ${detail.optionValue}`).join(' | ')
      : 'Variante sin atributos'
  }

  if (productCategorySlug.value === 'micas') {
    const lens = parseLensSku(item?.SKU)

    return lens
      ? `Esfera ${formatLensValue(lens.sphere)} | Cilindro ${formatLensValue(lens.cylinder)}`
      : 'Mica'
  }

  return 'Producto base'
}

function refreshStockFromSelection() {
  const currentStock = isLensProduct.value
    ? getItemOfficeStock(selectedLensSeries.value?.representativeItem, selectedOfficeID.value)
    : getItemOfficeStock(selectedProductItem.value, selectedOfficeID.value)

  productStock.value = currentStock
  initialStock.value = currentStock
}

function selectProductItem(itemId) {
  selectedProductItemId.value = itemId
  refreshStockFromSelection()
}

function selectLensSeries(seriesKey) {
  selectedLensSeriesKey.value = seriesKey
  refreshStockFromSelection()
}

function selectOffice(officeId) {
  selectedOfficeID.value = officeId
  refreshStockFromSelection()
}

function decrease() {
  if (Number(productStock.value) > 0) productStock.value--
}

function increase() {
  productStock.value = Number(productStock.value) + 1
}

async function submitForm() {
  try {
    if (
      !selectedOfficeID.value ||
      (!isLensProduct.value && selectedProductItemId.value === null) ||
      (isLensProduct.value && !selectedLensSeries.value)
    ) {
      throw new Error('Datos incompletos para actualizar el inventario')
    }

    isSubmitting.value = true

    const targetItems = isLensProduct.value
      ? selectedLensSeries.value.items
      : [selectedProductItem.value]

    for (const item of targetItems) {
      await api.post('inventory', {
        product_item_id: Number(item.id),
        branch_office_id: Number(selectedOfficeID.value),
        stock: Number(productStock.value),
      })

      const inventoryRows = getItemInventoryRows(item)
      const existingRow = inventoryRows.find(
        (row) => Number(row.branch_office_id) === Number(selectedOfficeID.value),
      )

      if (existingRow) {
        existingRow.stock = Number(productStock.value)
      } else {
        item.inventory = [
          ...inventoryRows,
          {
            product_item_id: Number(item.id),
            branch_office_id: Number(selectedOfficeID.value),
            stock: Number(productStock.value),
          },
        ]
      }
    }

    if (isLensProduct.value) {
      selectedLensSeries.value.totalStock = selectedLensSeries.value.items.reduce(
        (total, item) => total + getItemTotalStock(item),
        0,
      )
    } else {
      selectedProductItem.value.stock = Number(productStock.value)
    }

    initialStock.value = Number(productStock.value)
    toast.add({
      severity: 'success',
      summary: 'Disponibilidad actualizada',
      detail: isLensProduct.value
        ? 'El stock de la serie se actualizó correctamente.'
        : 'El stock de la variante se actualizó correctamente.',
      life: 4000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error?.message ?? 'Error al actualizar inventario',
      life: 4000,
    })
  } finally {
    isSubmitting.value = false
  }
}

async function retrieveData() {
  const [productResponse, productItemsResponse, productConfigurationsResponse] = await Promise.all([
    api.get(`products/${productCode}`),
    api.get('product-items'),
    api.get('product-configurations').catch(() => ({ data: [] })),
  ])

  product.value = productResponse.data
  productConfigurations.value = Array.isArray(productConfigurationsResponse.data)
    ? productConfigurationsResponse.data
    : []
  productItems.value = Array.isArray(productItemsResponse.data)
    ? productItemsResponse.data.filter(
        (item) => Number(item?.product_id) === Number(product.value?.id),
      )
    : []

  selectedProductItemId.value = productItems.value[0]?.id ?? null
  selectedLensSeriesKey.value = lensSeries.value[0]?.key ?? null
  selectedOfficeID.value = branchOffices.value[0]?.id ?? ''
  refreshStockFromSelection()
}

onMounted(async () => {
  try {
    await retrieveData()
    isLoading.value = false

    if (!hasProductItems.value) {
      toast.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Este producto no tiene variantes/SKU asociados. No se puede editar inventario.',
        life: 6000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo obtener información del producto',
      life: 4000,
    })
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

  <form
    v-else
    @submit.prevent="submitForm"
    class="mx-auto mt-10 flex max-w-6xl flex-col gap-6 px-6 pb-12"
  >
    <div class="flex flex-col gap-2">
      <h2 class="text-3xl font-bold text-sky-800">Disponibilidad de {{ product.name }}</h2>
      <p class="max-w-3xl text-sm font-medium text-slate-600">
        {{
          isLensProduct
            ? 'Selecciona una serie y una sucursal. El valor que captures se aplicará a todas las combinaciones de esa serie.'
            : 'Selecciona una variante y una sucursal. El valor que captures reemplaza el stock actual de esa variante en esa sucursal.'
        }}
      </p>
    </div>

    <div
      v-if="!hasProductItems"
      class="rounded-xl border border-amber-200 bg-amber-50 p-5 font-semibold text-amber-700"
    >
      Este producto no tiene variantes/SKU asociados.
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section
        class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-sky-800">
              {{ isLensProduct ? 'Series' : 'Variantes' }}
            </h3>
            <p class="text-sm font-medium text-slate-500">
              {{
                isLensProduct
                  ? `${lensSeries.length} series disponibles para administrar.`
                  : `${productItems.length} SKU disponibles para administrar.`
              }}
            </p>
          </div>
          <div class="rounded-lg bg-sky-50 px-4 py-2 text-right">
            <div class="text-xs font-semibold text-sky-600">Stock total</div>
            <div class="text-2xl font-bold text-sky-800">{{ totalStock }}</div>
          </div>
        </div>

        <div v-if="isLensProduct" class="grid gap-3 md:grid-cols-2">
          <button
            v-for="series in lensSeries"
            :key="series.key"
            type="button"
            @click="selectLensSeries(series.key)"
            :class="[
              selectedLensSeriesKey === series.key
                ? 'border-sky-600 bg-sky-50'
                : 'border-slate-200 bg-white hover:border-sky-300',
              'flex min-h-32 gap-3 rounded-xl border-2 p-3 text-left transition',
            ]"
          >
            <img
              :src="`${backendUrl}/storage/${series.image_url || product.image_url || product.product_image}`"
              :alt="series.label"
              class="h-20 w-20 shrink-0 rounded-lg border border-slate-200 bg-white object-contain object-center"
            />
            <span class="flex min-w-0 flex-1 flex-col gap-1">
              <span class="font-bold text-sky-800">{{ series.label }}</span>
              <span class="text-sm font-medium text-slate-600"
                >${{ Number(series.price || 0).toFixed(2) }}</span
              >
              <span class="text-xs font-medium text-slate-600">
                Esfera {{ formatLensValue(series.sphereMin) }} a
                {{ formatLensValue(series.sphereMax) }}
              </span>
              <span class="text-xs font-medium text-slate-600">
                Cilindro {{ formatLensValue(series.cylinderMax) }} a
                {{ formatLensValue(series.cylinderMin) }}
              </span>
              <span class="text-sm font-semibold text-emerald-700"
                >Total: {{ series.totalStock }}</span
              >
            </span>
          </button>
        </div>

        <div v-else class="grid gap-3 md:grid-cols-2">
          <button
            v-for="item in productItems"
            :key="item.id"
            type="button"
            @click="selectProductItem(item.id)"
            :class="[
              Number(selectedProductItemId) === Number(item.id)
                ? 'border-sky-600 bg-sky-50'
                : 'border-slate-200 bg-white hover:border-sky-300',
              'flex min-h-28 gap-3 rounded-xl border-2 p-3 text-left transition',
            ]"
          >
            <img
              :src="selectedItemImageSrc"
              alt="Variante"
              class="h-20 w-20 shrink-0 rounded-lg border border-slate-200 bg-white object-contain object-center"
            />
            <span class="flex min-w-0 flex-1 flex-col gap-1">
              <span class="font-bold text-sky-800">{{ item.SKU }}</span>
              <span class="text-sm font-medium text-slate-600">{{ getItemSubtitle(item) }}</span>
              <span class="text-sm font-semibold text-emerald-700"
                >Total: {{ getItemTotalStock(item) }}</span
              >
            </span>
          </button>
        </div>
      </section>

      <section
        class="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
      >
        <div class="flex gap-4">
          <img
            v-if="selectedItemImageSrc"
            :src="selectedItemImageSrc"
            alt="Vista previa"
            class="h-28 w-28 rounded-xl border border-sky-200 bg-white object-contain object-center"
          />
          <div class="flex flex-col justify-center">
            <div class="text-sm font-semibold text-slate-500">
              {{ isLensProduct ? 'Serie seleccionada' : 'SKU seleccionado' }}
            </div>
            <div class="text-2xl font-bold text-sky-800">
              {{ isLensProduct ? selectedLensSeries?.label : selectedProductItem?.SKU }}
            </div>
            <div class="text-sm font-medium text-slate-600">
              {{
                isLensProduct
                  ? `$${Number(selectedLensSeries?.price || 0).toFixed(2)}`
                  : getItemSubtitle(selectedProductItem)
              }}
            </div>
          </div>
        </div>

        <div>
          <label for="office" class="mb-2 block font-semibold text-sky-800">Sucursal</label>
          <select
            id="office"
            :value="selectedOfficeID"
            @change="selectOffice($event.target.value)"
            class="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option v-for="office in branchOffices" :key="office.id" :value="office.id">
              {{ office.name }}
            </option>
          </select>
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div class="text-sm font-semibold text-slate-500">
            Stock actual en {{ selectedOfficeName }}
          </div>
          <div class="mt-1 text-3xl font-bold text-sky-800">{{ initialStock }}</div>
          <div class="mt-1 text-sm font-medium text-slate-500">
            Stock total {{ isLensProduct ? 'de la serie' : 'de la variante' }}:
            {{ selectedItemTotalStock }}
          </div>
        </div>

        <div>
          <label for="stock" class="mb-2 block font-semibold text-sky-800">Nuevo stock</label>
          <div class="grid grid-cols-[44px_1fr_44px] gap-2">
            <button
              type="button"
              @click="decrease"
              class="rounded-xl bg-sky-700 text-xl font-bold text-white transition hover:bg-sky-800"
            >
              -
            </button>
            <input
              id="stock"
              v-model.number="productStock"
              type="number"
              min="0"
              class="min-w-0 rounded-xl border border-gray-300 p-3 text-center text-xl font-bold text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="button"
              @click="increase"
              class="rounded-xl bg-sky-700 text-xl font-bold text-white transition hover:bg-sky-800"
            >
              +
            </button>
          </div>
        </div>

        <div
          :class="[
            stockDelta > 0
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : stockDelta < 0
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-slate-200 bg-slate-50 text-slate-600',
            'rounded-xl border p-4 text-sm font-semibold',
          ]"
        >
          {{
            stockDelta === 0
              ? 'Sin cambios pendientes.'
              : `Cambio pendiente: ${stockDelta > 0 ? '+' : ''}${stockDelta} unidades.`
          }}
        </div>

        <button
          type="submit"
          :disabled="isSubmitting || !isStockModified"
          :class="[
            isSubmitting || !isStockModified ? 'bg-slate-400' : 'bg-sky-600 hover:bg-sky-700',
            'rounded-xl px-8 py-3 font-semibold text-white transition',
          ]"
        >
          {{ isSubmitting ? 'Guardando...' : 'Guardar disponibilidad' }}
        </button>
      </section>
    </div>
  </form>

  <Toast position="bottom-right" />
</template>
