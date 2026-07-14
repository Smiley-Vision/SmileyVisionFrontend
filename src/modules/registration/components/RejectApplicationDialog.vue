<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

import type { RegistrationApplication } from '@/modules/registration/interfaces/RegistrationApplication'

withDefaults(
  defineProps<{
    visible: boolean
    application: RegistrationApplication | null
    isRejecting?: boolean
  }>(),
  {
    isRejecting: false,
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
      <div class="text-[#075985] font-semibold">Rechazar solicitud</div>
    </template>
    <div class="text-slate-700 leading-relaxed">
      ¿Seguro que deseas rechazar la solicitud de <strong>{{ application?.email }}</strong>? Se le
      enviará un correo notificando que no fue aprobada.
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
          label="Rechazar"
          severity="danger"
          :loading="isRejecting"
          @click="$emit('confirm')"
        />
      </div>
    </template>
  </Dialog>
</template>
