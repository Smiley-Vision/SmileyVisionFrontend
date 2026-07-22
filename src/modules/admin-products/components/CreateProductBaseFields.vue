<script setup lang="ts">
import { FormField } from '@primevue/forms'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { inject, ref, watch } from 'vue'

import ImagePickerButton from '@/modules/admin-products/components/ImagePickerButton.vue'
import type { Supplier } from '@/modules/admin-products/interfaces/Supplier'

interface PrimeVueFormInstance {
  setFieldValue: (field: string, value: unknown) => void
}

const props = defineProps<{
  suppliers: Supplier[]
  isSuppliersLoading: boolean
  isLensCategory: boolean
}>()

const pcForm = inject<PrimeVueFormInstance>('$pcForm')

watch(
  () => props.suppliers,
  (suppliers) => {
    if (props.isLensCategory && suppliers.length > 0) {
      pcForm?.setFieldValue('supplier_id', suppliers[0].id)
    }
  },
)

const previewUrl = ref<string | null>(null)

defineExpose({ previewUrl })

function onImageSelected(file: File) {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)

  previewUrl.value = URL.createObjectURL(file)
  pcForm?.setFieldValue('image', file)
}
</script>

<template>
  <div class="grid md:grid-cols-[220px_1fr] grid-cols-1 gap-8">
    <div class="flex flex-col items-center gap-3">
      <FormField v-slot="$field" name="image" as-child>
        <div class="flex flex-col items-center gap-2">
          <ImagePickerButton :preview-url="previewUrl" @select="onImageSelected" />
          <Message v-if="$field.invalid" severity="error" size="small">{{
            $field.error?.message
          }}</Message>
        </div>
      </FormField>
      <p class="text-sm text-center text-gray-600">Imagen para producto e ítems</p>
    </div>

    <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
      <FormField v-slot="$field" name="supplier_id" class="flex flex-col gap-1">
        <label for="supplier_id" class="font-medium text-sky-700">Proveedor</label>
        <Select
          id="supplier_id"
          :options="suppliers"
          option-label="name"
          option-value="id"
          :loading="isSuppliersLoading"
          :disabled="isSuppliersLoading || suppliers.length === 0"
          placeholder="Selecciona un proveedor"
          fluid
        />
        <Message v-if="$field.invalid" severity="error" size="small">{{
          $field.error?.message
        }}</Message>
      </FormField>

      <FormField v-slot="$field" name="name" class="flex flex-col gap-1">
        <label for="name" class="font-medium text-sky-700">Nombre del producto</label>
        <InputText id="name" fluid />
        <Message v-if="$field.invalid" severity="error" size="small">{{
          $field.error?.message
        }}</Message>
      </FormField>

      <FormField v-slot="$field" name="description" class="flex flex-col gap-1 md:col-span-2">
        <label for="description" class="font-medium text-sky-700">Descripción</label>
        <Textarea id="description" rows="3" fluid />
        <Message v-if="$field.invalid" severity="error" size="small">{{
          $field.error?.message
        }}</Message>
      </FormField>
    </div>
  </div>
</template>
