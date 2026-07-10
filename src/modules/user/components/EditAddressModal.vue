<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

import AddressFormFields from '@/modules/user/components/AddressFormFields.vue'
import type { AddressFormData } from '@/modules/user/interfaces/Address'
import type { CityOption } from '@/modules/user/interfaces/CityOption'

withDefaults(
  defineProps<{
    visible: boolean
    form: AddressFormData
    cityOptions: CityOption[]
    isSaving?: boolean
  }>(),
  {
    isSaving: false,
  },
)

defineEmits<{
  'update:visible': [value: boolean]
  submit: []
}>()
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
    <form class="flex flex-col gap-4" @submit.prevent="$emit('submit')">
      <AddressFormFields :form="form" :city-options="cityOptions" id-prefix="edit" />

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
    </form>
  </Dialog>
</template>
