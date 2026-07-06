<script setup>
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

import AddressFormFields from '@/modules/user/components/AddressFormFields.vue'

defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
  cityOptions: {
    type: Array,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:visible', 'submit'])
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :style="{ width: '42rem' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="text-[#075985] font-semibold">Agregar dirección</div>
    </template>
    <form class="flex flex-col gap-4" @submit.prevent="$emit('submit')">
      <AddressFormFields :form="form" :city-options="cityOptions" id-prefix="new" />

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
