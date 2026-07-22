<script setup lang="ts">
import Dialog from 'primevue/dialog'

defineProps<{
  visible: boolean
}>()

defineEmits<{
  'update:visible': [value: boolean]
}>()
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :draggable="false"
    :style="{ width: '42rem' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="text-2xl font-semibold text-sky-800">Aviso de privacidad</div>
    </template>
    <div class="space-y-6 text-base leading-8 text-slate-600">
      <p>
        Smiley Vision utiliza la información enviada por ópticas y proveedores únicamente para
        evaluar solicitudes de registro, dar seguimiento comercial y brindar atención al cliente.
      </p>
      <p>
        Los datos compartidos mediante formularios, correo electrónico o medios de contacto se
        revisan de forma manual por el equipo de Smiley Vision con fines de validación del negocio
        y activación de cuentas autorizadas.
      </p>
      <p>
        Si deseas actualizar o solicitar información sobre el tratamiento de tus datos, puedes
        escribir a
        <a href="mailto:contacto.sv@gmail.com" class="font-semibold text-sky-700 hover:underline">
          contacto.sv@gmail.com </a
        >.
      </p>
    </div>
  </Dialog>
</template>
