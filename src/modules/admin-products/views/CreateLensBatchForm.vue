<script setup lang="ts">
import Button from 'primevue/button'
import Select from 'primevue/select'
import { computed, onMounted, ref } from 'vue'

import CreateLensSeriesFields from '@/modules/admin-products/components/CreateLensSeriesFields.vue'
import { useLensSeries } from '@/modules/admin-products/composables/useLensSeries'
import { useProductCatalog } from '@/modules/admin-products/composables/useProductCatalog'
import type { Product } from '@/modules/admin-products/interfaces/Product'
import { getProductsByCategoryService } from '@/modules/admin-products/services/productCatalogService'
import { createLensBatchService } from '@/modules/admin-products/services/productItemService'
import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'

const notify = useAppToast()
const catalog = useProductCatalog()
const lensSeries = useLensSeries()

const isLoading = ref(true)
const isSubmitting = ref(false)
const micasProducts = ref<Product[]>([])
const selectedProductId = ref<number | null>(null)
const batchResult = ref<{ created: number; skipped: number; total: number } | null>(null)

const series = computed(() => lensSeries.series[0])
const seriesErrors = computed(() => lensSeries.rowErrors.value[0] ?? [])

const canSubmit = computed(
  () => !isSubmitting.value && selectedProductId.value !== null && lensSeries.isValid.value,
)

async function loadMicasProducts() {
  const micasCategory = catalog.findCategoryBySlug('micas')

  if (!micasCategory) return

  const response = await getProductsByCategoryService(micasCategory.id)

  micasProducts.value = response.data
  selectedProductId.value = micasProducts.value[0]?.id ?? null
}

async function submitBatch() {
  if (!canSubmit.value || selectedProductId.value === null) {
    notify('warn', 'Datos incompletos', 'Verifica el producto y los intervalos capturados.')
    return
  }

  isSubmitting.value = true
  batchResult.value = null

  try {
    const response = await createLensBatchService({
      productId: selectedProductId.value,
      price: series.value.price,
      sphereMin: series.value.sphereMin,
      sphereMax: series.value.sphereMax,
      cylinderMin: series.value.cylinderMin,
      cylinderMax: series.value.cylinderMax,
      image: series.value.image,
    })

    batchResult.value = {
      created: response.data.created_count,
      skipped: response.data.skipped_count,
      total: response.data.total_count,
    }

    notify(
      'success',
      'Serie agregada',
      `Se crearon ${response.data.created_count} ítems. ${response.data.skipped_count} ya existían.`,
      7000,
    )

    lensSeries.reset()
  } catch (error) {
    notify(
      'error',
      'No fue posible crear la serie',
      firstProblemMessage(error as ApiProblemDetails),
    )
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  isLoading.value = true

  try {
    await catalog.loadCategories()
    await loadMicasProducts()
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div
    class="flex flex-col max-w-3xl mx-auto mt-12 md:mb-0 mb-12 md:px-10 md:py-10 px-8 gap-8 md:bg-white md:rounded-3xl md:shadow-2xl"
  >
    <div class="flex flex-col gap-2">
      <h2 class="text-3xl font-bold text-sky-800 text-center">Agregar serie de lentes</h2>
      <p class="text-sm text-slate-600 text-center">
        Selecciona un producto de mica existente y define el rango de esfera y cilindro de la nueva
        serie.
      </p>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center gap-y-6 py-8">
      <div class="text-sky-600 pi pi-spinner-dotted animate-spin" style="font-size: 5rem"></div>
      <div class="text-xl font-semibold text-sky-700">Cargando productos...</div>
    </div>

    <form v-else @submit.prevent="submitBatch" class="flex flex-col gap-6">
      <div>
        <label for="product_id" class="block text-sky-700 font-medium mb-1"
          >Producto base de lentes</label
        >
        <Select
          id="product_id"
          v-model="selectedProductId"
          :options="micasProducts"
          option-label="name"
          option-value="id"
          placeholder="Selecciona un producto"
          fluid
        />
      </div>

      <CreateLensSeriesFields
        :series="series"
        label="Nueva serie"
        :errors="seriesErrors"
        @select-image="(file) => lensSeries.setSeriesImage(0, file)"
        @clear-image="lensSeries.clearSeriesImage(0)"
      />

      <Button
        type="submit"
        label="Crear serie"
        :loading="isSubmitting"
        :disabled="!canSubmit"
        size="large"
      />
    </form>

    <div
      v-if="batchResult"
      class="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 flex flex-col gap-2"
    >
      <div class="font-semibold text-emerald-800">Resultado de la creación</div>
      <div class="text-sm text-emerald-800">Ítems creados: {{ batchResult.created }}</div>
      <div class="text-sm text-emerald-800">Ítems ya existentes: {{ batchResult.skipped }}</div>
      <div class="text-sm text-emerald-800">Combinaciones procesadas: {{ batchResult.total }}</div>
    </div>
  </div>
</template>
