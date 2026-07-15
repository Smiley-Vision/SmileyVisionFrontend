<script setup lang="ts">
import { FormField } from '@primevue/forms'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import MultiSelect from 'primevue/multiselect'
import { computed, inject } from 'vue'

import ImagePickerButton from '@/modules/admin-products/components/ImagePickerButton.vue'
import { useFrameVariants } from '@/modules/admin-products/composables/useFrameVariants'
import type { Variation } from '@/modules/admin-products/interfaces/Variation'

interface PrimeVueFormFieldState {
  value: unknown
}

interface PrimeVueFormInstance {
  getFieldState: (field: string) => PrimeVueFormFieldState | undefined
}

const props = defineProps<{
  frameVariations: Variation[]
  baseImagePreviewUrl: string | null
}>()

const pcForm = inject<PrimeVueFormInstance>('$pcForm')

const frameVariationsRef = computed(() => props.frameVariations)
const skuPrefix = computed(() => (pcForm?.getFieldState('sku_prefix')?.value as string) ?? '')
const colorOptionIds = computed(
  () => (pcForm?.getFieldState('color_option_ids')?.value as number[]) ?? [],
)
const materialOptionIds = computed(
  () => (pcForm?.getFieldState('material_option_ids')?.value as number[]) ?? [],
)

const {
  colorOptions,
  materialOptions,
  combinations,
  rows,
  setVariantImage,
  clearVariantImage,
  validateRows,
} = useFrameVariants(frameVariationsRef, colorOptionIds, materialOptionIds, skuPrefix)

defineExpose({ combinations, rows, validateRows })
</script>

<template>
  <div class="flex flex-col gap-5">
    <FormField v-slot="$field" name="sku_prefix" class="flex max-w-xs flex-col gap-1">
      <label for="sku_prefix" class="font-medium text-sky-700">Prefijo SKU</label>
      <InputText id="sku_prefix" fluid />
      <Message v-if="$field.invalid" severity="error" size="small">{{
        $field.error?.message
      }}</Message>
    </FormField>

    <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
      <FormField v-slot="$field" name="color_option_ids" class="flex flex-col gap-1">
        <label class="font-medium text-sky-700">Colores</label>
        <MultiSelect
          :options="colorOptions"
          option-label="value"
          option-value="id"
          display="chip"
          placeholder="Selecciona los colores"
          fluid
        />
        <Message v-if="$field.invalid" severity="error" size="small">{{
          $field.error?.message
        }}</Message>
      </FormField>

      <FormField v-slot="$field" name="material_option_ids" class="flex flex-col gap-1">
        <label class="font-medium text-sky-700">Materiales</label>
        <MultiSelect
          :options="materialOptions"
          option-label="value"
          option-value="id"
          display="chip"
          placeholder="Selecciona los materiales"
          fluid
        />
        <Message v-if="$field.invalid" severity="error" size="small">{{
          $field.error?.message
        }}</Message>
      </FormField>
    </div>

    <div v-if="combinations.length > 0" class="rounded-xl border border-sky-200 bg-sky-50 p-4">
      <div class="mb-3 font-bold text-sky-800">Variantes a crear: {{ combinations.length }}</div>
      <div class="flex flex-col gap-3">
        <div
          v-for="combination in combinations"
          :key="combination.sku"
          class="grid items-center gap-3 rounded-lg border border-sky-100 bg-white p-3 md:grid-cols-[8rem_1fr_10rem_8rem]"
        >
          <div class="font-bold text-sky-800">{{ combination.sku }}</div>
          <div class="font-medium text-slate-600">
            {{ combination.colorOption.value }} / {{ combination.materialOption.value }}
          </div>
          <InputNumber
            v-model="rows[combination.index].price"
            mode="currency"
            currency="MXN"
            locale="es-MX"
            :min="0"
            placeholder="Precio"
          />
          <div class="flex flex-col items-center gap-1">
            <ImagePickerButton
              size="sm"
              :preview-url="rows[combination.index].previewUrl ?? baseImagePreviewUrl"
              @select="(file) => setVariantImage(combination.index, file)"
            />
            <button
              v-if="rows[combination.index].previewUrl"
              type="button"
              class="text-xs font-semibold text-sky-700 underline"
              @click="clearVariantImage(combination.index)"
            >
              Usar imagen del producto
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
