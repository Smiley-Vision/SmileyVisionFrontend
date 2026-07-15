<script setup lang="ts">
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Select from 'primevue/select'

import ImagePickerButton from '@/modules/admin-products/components/ImagePickerButton.vue'
import type { LensSeriesRow } from '@/modules/admin-products/composables/useLensSeries'
import { cylinderOptions, sphereOptions } from '@/modules/admin-products/utils/lensOptions'

withDefaults(
  defineProps<{
    series: LensSeriesRow
    label: string
    errors?: string[]
    baseImagePreviewUrl?: string | null
    removable?: boolean
  }>(),
  {
    errors: () => [],
    baseImagePreviewUrl: null,
    removable: false,
  },
)

defineEmits<{
  remove: []
  selectImage: [file: File]
  clearImage: []
}>()
</script>

<template>
  <div class="rounded-xl border border-slate-200 p-4">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 class="text-lg font-bold text-sky-800">{{ label }}</h3>
      <button
        v-if="removable"
        type="button"
        class="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
        @click="$emit('remove')"
      >
        Quitar serie
      </button>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1fr_12rem]">
      <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
        <div class="md:col-span-2">
          <label class="mb-1 block font-medium text-sky-700">Precio por mica</label>
          <InputNumber
            v-model="series.price"
            mode="currency"
            currency="MXN"
            locale="es-MX"
            :min="0"
            fluid
          />
        </div>
        <div>
          <label class="mb-1 block font-medium text-sky-700">Esfera desde</label>
          <Select v-model="series.sphereMin" :options="sphereOptions" fluid />
        </div>
        <div>
          <label class="mb-1 block font-medium text-sky-700">Esfera hasta</label>
          <Select v-model="series.sphereMax" :options="sphereOptions" fluid />
        </div>
        <div>
          <label class="mb-1 block font-medium text-sky-700">Cilindro desde</label>
          <Select v-model="series.cylinderMin" :options="cylinderOptions" fluid />
        </div>
        <div>
          <label class="mb-1 block font-medium text-sky-700">Cilindro hasta</label>
          <Select v-model="series.cylinderMax" :options="cylinderOptions" fluid />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="text-sm font-bold text-sky-700">Imagen de serie</div>
        <ImagePickerButton
          size="sm"
          :preview-url="series.previewUrl ?? baseImagePreviewUrl"
          @select="$emit('selectImage', $event)"
        />
        <button
          v-if="series.previewUrl"
          type="button"
          class="rounded-lg border border-sky-200 px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-50"
          @click="$emit('clearImage')"
        >
          Usar imagen del producto
        </button>
      </div>
    </div>

    <div v-if="errors.length > 0" class="mt-3 flex flex-col gap-1">
      <Message v-for="error in errors" :key="error" severity="error" size="small">{{
        error
      }}</Message>
    </div>
  </div>
</template>
