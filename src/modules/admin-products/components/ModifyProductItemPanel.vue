<script setup lang="ts">
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import { onMounted } from 'vue'

import ImagePickerButton from '@/modules/admin-products/components/ImagePickerButton.vue'
import { useModifyProductItemForm } from '@/modules/admin-products/composables/useModifyProductItemForm'
import Spinner from '@/modules/core/components/Spinner.vue'

const props = defineProps<{
  productId: number
}>()

const backendUrl = import.meta.env.VITE_BACKEND_BASE

const {
  isLoading,
  isSubmitting,
  hasError,
  product,
  productItems,
  hasProductItems,
  isLensProduct,
  lensSeries,
  selectedLensSeries,
  selectedProductItem,
  selectedProductItemId,
  selectedLensSeriesKey,
  itemPrice,
  isFormModified,
  currentImageSrc,
  getItemSubtitle,
  selectProductItem,
  selectLensSeries,
  onImageSelected,
  submitForm,
  loadData,
} = useModifyProductItemForm(props.productId)

onMounted(async () => {
  await loadData()
})
</script>

<template>
  <div class="w-full max-w-5xl">
    <Spinner :is-loading="isLoading" text="Cargando ítems..." />

    <div v-if="!isLoading && hasError" class="flex flex-col items-center gap-y-3 py-12 text-center">
      <div class="text-lg font-semibold text-red-600">No se pudieron cargar los ítems.</div>
    </div>

    <div
      v-else-if="!isLoading && !hasProductItems"
      class="rounded-xl border border-amber-200 bg-amber-50 p-5 font-semibold text-amber-700"
    >
      Este producto no tiene variantes/SKU asociados.
    </div>

    <div v-else-if="!isLoading" class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section
        class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
      >
        <h3 class="text-xl font-bold text-sky-800">
          {{ isLensProduct ? 'Series' : 'Variantes' }}
        </h3>

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
              'flex min-h-24 gap-3 rounded-xl border-2 p-3 text-left transition',
            ]"
          >
            <img
              :src="`${backendUrl}/storage/${series.image_url || product?.image_path}`"
              :alt="series.label"
              class="h-16 w-16 shrink-0 rounded-lg border border-slate-200 bg-white object-contain object-center"
            />
            <span class="flex min-w-0 flex-1 flex-col gap-1">
              <span class="font-bold text-sky-800">{{ series.label }}</span>
              <span class="text-sm font-medium text-slate-600"
                >${{ Number(series.price || 0).toFixed(2) }}</span
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
              selectedProductItemId === item.id
                ? 'border-sky-600 bg-sky-50'
                : 'border-slate-200 bg-white hover:border-sky-300',
              'flex min-h-24 gap-3 rounded-xl border-2 p-3 text-left transition',
            ]"
          >
            <img
              :src="`${backendUrl}/storage/${item.image_path || product?.image_path}`"
              alt="Variante"
              class="h-16 w-16 shrink-0 rounded-lg border border-slate-200 bg-white object-contain object-center"
            />
            <span class="flex min-w-0 flex-1 flex-col gap-1">
              <span class="font-bold text-sky-800">{{ item.SKU }}</span>
              <span class="text-sm font-medium text-slate-600">{{ getItemSubtitle(item) }}</span>
              <span class="text-sm font-semibold text-slate-500"
                >${{ Number(item.price).toFixed(2) }}</span
              >
            </span>
          </button>
        </div>
      </section>

      <section
        class="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
      >
        <div class="text-sm font-semibold text-slate-500">
          {{ isLensProduct ? 'Serie seleccionada' : 'SKU seleccionado' }}
        </div>
        <div class="text-2xl font-bold text-sky-800">
          {{ isLensProduct ? selectedLensSeries?.label : selectedProductItem?.SKU }}
        </div>

        <ImagePickerButton
          :preview-url="currentImageSrc ? `${backendUrl}/storage/${currentImageSrc}` : null"
          @select="onImageSelected"
        />

        <div class="flex flex-col gap-1">
          <label for="item-price" class="font-medium text-sky-700">Precio</label>
          <InputNumber
            id="item-price"
            v-model="itemPrice"
            mode="currency"
            currency="MXN"
            locale="es-MX"
            :min="0"
            fluid
          />
        </div>

        <Button
          label="Guardar cambios"
          :loading="isSubmitting"
          :disabled="!isFormModified"
          @click="submitForm"
        />
      </section>
    </div>
  </div>
</template>
