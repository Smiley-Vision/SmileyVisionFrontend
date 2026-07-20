<script setup lang="ts">
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Tag from 'primevue/tag'

import type { ProductItem } from '@/modules/catalog/interfaces/ProductItem'
import { formatPrice } from '@/modules/catalog/utils/formatPrice'
import { type LensSeries, formatLensValue } from '@/modules/catalog/utils/lensSeries'

defineProps<{
  lensSeries: LensSeries[]
  fallbackImagePath: string
  selectedLensSeriesQuantities: Record<string, number>
  selectedLensSeriesTotalQuantity: number
  selectedLensSeriesTotalPrice: number
  getSelectedLensItem: (series: LensSeries) => ProductItem | null
  getLensSphereOptions: (series: LensSeries) => { label: string; value: number }[]
  getLensCylinderOptions: (series: LensSeries) => { label: string; value: number }[]
  getSelectedLensSphere: (series: LensSeries) => number | null
  getSelectedLensCylinder: (series: LensSeries) => number | null
}>()

const emit = defineEmits<{
  'update-quantity': [seriesKey: string, quantity: number]
  'select-lens-item': [seriesKey: string, sphere: number, cylinder: number]
}>()

const backendUrl = import.meta.env.VITE_BACKEND_BASE
</script>

<template>
  <div class="mt-2 flex flex-col gap-5 rounded-xl border border-sky-100 bg-sky-50/80 p-5">
    <div class="flex flex-col gap-1">
      <div class="text-lg font-semibold text-sky-800">Series disponibles</div>
      <div class="text-sm text-slate-600">
        Selecciona las micas que quieres agregar a tu pedido.
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
            :src="`${backendUrl}/storage/${series.image_path || fallbackImagePath}`"
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
              <div class="text-xl font-bold text-sky-800">${{ formatPrice(series.price) }}</div>
            </div>
            <div class="mt-2 text-sm font-medium text-slate-600">
              Esfera {{ formatLensValue(series.sphereMin) }} a
              {{ formatLensValue(series.sphereMax) }}
            </div>
            <div class="text-sm font-medium text-slate-600">
              Cilindro {{ formatLensValue(series.cylinderMax) }} a
              {{ formatLensValue(series.cylinderMin) }}
            </div>
            <Tag
              :severity="series.totalStock > 0 ? 'success' : 'danger'"
              :value="`Stock total: ${series.totalStock}`"
              class="mt-1"
            />
          </div>
          <div class="w-full shrink-0 sm:w-36">
            <InputNumber
              :model-value="selectedLensSeriesQuantities[series.key] ?? 0"
              show-buttons
              button-layout="horizontal"
              :min="0"
              :max="Number(getSelectedLensItem(series)?.stock ?? 0)"
              fluid
              input-class="text-center"
              @update:model-value="(value) => emit('update-quantity', series.key, value ?? 0)"
            >
              <template #incrementicon><i class="pi pi-plus"></i></template>
              <template #decrementicon><i class="pi pi-minus"></i></template>
            </InputNumber>
          </div>
        </div>

        <div
          v-if="series.items.length > 1"
          class="mt-3 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3"
        >
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Esfera</label>
            <Select
              :model-value="getSelectedLensSphere(series)"
              :options="getLensSphereOptions(series)"
              option-label="label"
              option-value="value"
              class="w-28"
              @update:model-value="
                (sphere) =>
                  emit('select-lens-item', series.key, sphere, getSelectedLensCylinder(series) ?? 0)
              "
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Cilindro</label>
            <Select
              :model-value="getSelectedLensCylinder(series)"
              :options="getLensCylinderOptions(series)"
              option-label="label"
              option-value="value"
              class="w-28"
              @update:model-value="
                (cylinder) =>
                  emit('select-lens-item', series.key, getSelectedLensSphere(series) ?? 0, cylinder)
              "
            />
          </div>
          <Tag
            :severity="Number(getSelectedLensItem(series)?.stock ?? 0) > 0 ? 'success' : 'danger'"
            :value="`Disponible: ${Number(getSelectedLensItem(series)?.stock ?? 0)}`"
          />
        </div>
      </div>
    </div>

    <div class="rounded-xl border-2 border-slate-500 bg-white px-5 py-4">
      <div class="flex items-center justify-between gap-4 text-lg text-slate-600">
        <span>Micas seleccionadas:</span>
        <span class="font-semibold">{{ selectedLensSeriesTotalQuantity }}</span>
      </div>
      <div class="mt-2 flex items-center justify-between gap-4 text-xl text-slate-600">
        <span>Total estimado:</span>
        <span class="font-bold text-3xl text-sky-800"
          >${{ formatPrice(selectedLensSeriesTotalPrice) }}</span
        >
      </div>
    </div>
  </div>
</template>
