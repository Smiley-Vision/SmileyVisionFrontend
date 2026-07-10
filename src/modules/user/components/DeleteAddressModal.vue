<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

withDefaults(
  defineProps<{
    visible: boolean
    isDeleting?: boolean
  }>(),
  {
    isDeleting: false,
  },
)

defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :style="{ width: '30rem' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="text-[#075985] font-semibold">Eliminar dirección</div>
    </template>
    <div class="text-slate-700 leading-relaxed">
      ¿Seguro que deseas eliminar esta dirección? Esta acción se mostrará de inmediato en la vista.
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          label="Cancelar"
          severity="secondary"
          text
          @click="$emit('update:visible', false)"
        />
        <Button
          label="Eliminar"
          severity="danger"
          :loading="isDeleting"
          @click="$emit('confirm')"
        />
      </div>
    </template>
  </Dialog>
</template>
