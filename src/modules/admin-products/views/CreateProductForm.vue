<script setup lang="ts">
import { Form, FormField, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { computed, onMounted, ref } from 'vue'
import { z } from 'zod'

import CreateEquipmentItemFields from '@/modules/admin-products/components/CreateEquipmentItemFields.vue'
import CreateFrameItemFields from '@/modules/admin-products/components/CreateFrameItemFields.vue'
import CreateLensSeriesFields from '@/modules/admin-products/components/CreateLensSeriesFields.vue'
import CreateProductBaseFields from '@/modules/admin-products/components/CreateProductBaseFields.vue'
import CreateProductCategoryPicker from '@/modules/admin-products/components/CreateProductCategoryPicker.vue'
import { useCreateProductSubmit } from '@/modules/admin-products/composables/useCreateProductSubmit'
import { useLensSeries } from '@/modules/admin-products/composables/useLensSeries'
import type { ProductCategorySlug } from '@/modules/admin-products/composables/useProductCatalog'
import { useProductCatalog } from '@/modules/admin-products/composables/useProductCatalog'
import { equipmentItemSchema } from '@/modules/admin-products/schemas/equipmentItemSchema'
import { frameItemSchema } from '@/modules/admin-products/schemas/frameItemSchema'
import { productBaseSchema } from '@/modules/admin-products/schemas/productBaseSchema'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import { getCategorySlug } from '@/modules/core/utils/productApiAdapters'

const notify = useAppToast()
const catalog = useProductCatalog()
const { isSubmitting, submit } = useCreateProductSubmit()
const lensSeries = useLensSeries()

const selectedTypeSlug = ref<ProductCategorySlug | ''>('')

const baseFieldsRef = ref<InstanceType<typeof CreateProductBaseFields> | null>(null)
const frameFieldsRef = ref<InstanceType<typeof CreateFrameItemFields> | null>(null)

const categoryLabels: Record<ProductCategorySlug, string> = {
  equipos: 'Equipo',
  armazones: 'Armazón',
  micas: 'Mica',
}
const categoryOrder: ProductCategorySlug[] = ['equipos', 'armazones', 'micas']

const categoryCards = computed(() => {
  return categoryOrder
    .map((slug) => {
      const category = catalog.categories.value.find(
        (candidate) => getCategorySlug(candidate.name) === slug,
      )

      return category ? { id: category.id, slug, label: categoryLabels[slug] } : null
    })
    .filter(
      (card): card is { id: number; slug: ProductCategorySlug; label: string } => card !== null,
    )
})

const selectedCategory = computed(() =>
  catalog.findCategoryBySlug(selectedTypeSlug.value || 'equipos'),
)

const currentSchema = computed(() => {
  if (selectedTypeSlug.value === 'equipos')
    return productBaseSchema.extend(equipmentItemSchema.shape)
  if (selectedTypeSlug.value === 'armazones') return productBaseSchema.extend(frameItemSchema.shape)

  return productBaseSchema
})

const resolver = computed(() => zodResolver(currentSchema.value as z.ZodType))

const initialValues = computed(() => {
  const base = {
    category_id: selectedCategory.value?.id ?? null,
    supplier_id: null,
    image: null,
    name: '',
    description: '',
  }

  if (selectedTypeSlug.value === 'equipos') {
    return { ...base, sku: '', price: 0 }
  }

  if (selectedTypeSlug.value === 'armazones') {
    return { ...base, sku_prefix: '', color_option_ids: [], material_option_ids: [] }
  }

  return base
})

function selectProductType(slug: string) {
  const typedSlug = slug as ProductCategorySlug

  selectedTypeSlug.value = typedSlug
  lensSeries.reset()

  const category = catalog.findCategoryBySlug(typedSlug)

  if (!category) return

  catalog.loadSuppliersForCategory(category.id)

  if (typedSlug === 'armazones') {
    catalog.loadFrameVariations(category.id)
  }
}

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return

  const values = event.values as Record<string, unknown>
  const base = {
    category_id: values.category_id as number,
    supplier_id: values.supplier_id as number,
    image: values.image as File,
    name: values.name as string,
    description: values.description as string,
  }

  if (selectedTypeSlug.value === 'armazones') {
    const frameErrors = frameFieldsRef.value?.validateRows() ?? []

    if (frameErrors.length > 0) {
      notify('warn', 'Revisa las variantes', frameErrors[0])
      return
    }
  }

  if (selectedTypeSlug.value === 'micas') {
    if (!lensSeries.isValid.value) {
      notify('warn', 'Revisa las series', 'Corrige los errores en las series de mica.')
      return
    }
  }

  const success = await submit({
    category: selectedTypeSlug.value as ProductCategorySlug,
    base,
    equipment:
      selectedTypeSlug.value === 'equipos'
        ? { sku: values.sku as string, price: values.price as number }
        : undefined,
    frame:
      selectedTypeSlug.value === 'armazones' && frameFieldsRef.value
        ? { combinations: frameFieldsRef.value.combinations, rows: frameFieldsRef.value.rows }
        : undefined,
    lens: selectedTypeSlug.value === 'micas' ? { series: lensSeries.series } : undefined,
  })

  if (success) {
    selectedTypeSlug.value = ''
    lensSeries.reset()
  }
}

onMounted(async () => {
  await catalog.loadCategories()
})
</script>

<template>
  <div class="bg-slate-100 py-10">
    <div
      class="flex flex-col bg-white max-w-4xl mx-auto md:px-10 md:py-10 px-8 gap-8 rounded-2xl md:shadow-2xl"
    >
      <h2 class="text-3xl font-bold text-sky-800 text-center">Añadir producto</h2>

      <div v-if="catalog.isLoadingCategories.value" class="flex flex-col items-center gap-y-6 py-8">
        <div class="text-sky-600 pi pi-spinner-dotted animate-spin" style="font-size: 5rem"></div>
        <div class="text-xl font-semibold text-sky-700">Cargando formulario...</div>
      </div>

      <div
        v-else-if="catalog.hasError.value"
        class="flex flex-col items-center gap-y-3 py-24 text-center"
      >
        <div class="flex size-20 items-center justify-center rounded-full bg-red-50 text-red-500">
          <i class="pi pi-exclamation-triangle" style="font-size: 2.5rem"></i>
        </div>
        <div class="text-2xl font-semibold text-sky-800">No se pudieron cargar las categorías</div>
        <div class="max-w-md text-slate-500">
          Verifica tu conexión o que el servidor esté disponible e intenta de nuevo.
        </div>
        <Button label="Reintentar" @click="catalog.loadCategories()" />
      </div>

      <template v-else>
        <section class="flex flex-col gap-4">
          <h3 class="text-xl font-bold text-sky-800">Tipo de producto</h3>
          <CreateProductCategoryPicker
            :cards="categoryCards"
            :selected="selectedTypeSlug"
            @select="selectProductType"
          />
        </section>

        <Form
          v-if="selectedTypeSlug"
          :key="selectedTypeSlug"
          class="flex flex-col gap-8"
          :resolver="resolver"
          :initial-values="initialValues"
          @submit="handleSubmit"
        >
          <FormField name="category_id" as-child />

          <CreateProductBaseFields
            ref="baseFieldsRef"
            :suppliers="catalog.suppliers.value"
            :is-suppliers-loading="catalog.isLoadingSuppliers.value"
          />

          <CreateEquipmentItemFields v-if="selectedTypeSlug === 'equipos'" />

          <CreateFrameItemFields
            v-if="selectedTypeSlug === 'armazones'"
            ref="frameFieldsRef"
            :frame-variations="catalog.frameVariations.value"
            :base-image-preview-url="baseFieldsRef?.previewUrl ?? null"
          />

          <section v-if="selectedTypeSlug === 'micas'" class="flex flex-col gap-5">
            <CreateLensSeriesFields
              v-for="(series, index) in lensSeries.series"
              :key="series.id"
              :series="series"
              :label="`Serie ${index + 1}`"
              :errors="lensSeries.rowErrors.value[index]"
              :base-image-preview-url="baseFieldsRef?.previewUrl ?? null"
              :removable="lensSeries.series.length > 1"
              @remove="lensSeries.removeSeries(index)"
              @select-image="(file) => lensSeries.setSeriesImage(index, file)"
              @clear-image="lensSeries.clearSeriesImage(index)"
            />

            <button
              type="button"
              class="rounded-xl border border-dashed border-sky-300 bg-sky-50 px-5 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-100"
              @click="lensSeries.addSeries()"
            >
              Añadir serie
            </button>

            <Message
              v-for="warning in lensSeries.overlapWarnings.value"
              :key="warning"
              severity="warn"
              size="small"
              >{{ warning }}</Message
            >
          </section>

          <Button type="submit" label="Crear producto" :loading="isSubmitting" size="large" />
        </Form>
      </template>
    </div>
  </div>
</template>
