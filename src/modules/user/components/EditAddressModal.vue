<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

import AddressFormFields from '@/modules/user/components/AddressFormFields.vue'
import type { AddressFormData } from '@/modules/user/interfaces/Address'
import type { CityOption } from '@/modules/user/interfaces/CityOption'
import { addressSchema, type AddressFormValues } from '@/modules/user/schemas/address'

withDefaults(
  defineProps<{
    visible: boolean
    initialValues: AddressFormData
    cityOptions: CityOption[]
    isSaving?: boolean
  }>(),
  {
    isSaving: false,
  },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [values: AddressFormValues]
}>()

const resolver = zodResolver(addressSchema)

function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return

  emit('submit', event.values as AddressFormValues)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :style="{ width: '42rem' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="text-[#075985] font-semibold">Editar dirección</div>
    </template>
    <Form
      class="flex flex-col gap-4"
      :resolver="resolver"
      :initial-values="initialValues"
      @submit="handleSubmit"
    >
      <AddressFormFields :city-options="cityOptions" id-prefix="edit" />

      <div class="flex justify-end gap-3 mt-4">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          text
          @click="$emit('update:visible', false)"
        />
        <Button type="submit" label="Guardar" :loading="isSaving" />
      </div>
    </Form>
  </Dialog>
</template>
