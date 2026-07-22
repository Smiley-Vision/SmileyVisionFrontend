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
      <div class="text-2xl font-semibold text-sky-800">Términos y condiciones</div>
    </template>
    <div class="space-y-6 text-base leading-8 text-slate-600">
      <p>
        El acceso de compra dentro de Smiley Vision está dirigido exclusivamente a ópticas y
        proveedores autorizados. Toda solicitud de registro se valida manualmente antes de
        habilitar una cuenta.
      </p>
      <p>
        La disponibilidad de productos, tiempos de entrega y condiciones comerciales pueden variar
        según inventario, validación del cliente y cobertura de servicio.
      </p>
      <p>
        Al utilizar este sitio, aceptas proporcionar información verídica para el proceso de
        validación y resguardar tus credenciales una vez activada la cuenta. Para dudas
        adicionales, contáctanos en
        <a href="mailto:contacto.sv@gmail.com" class="font-semibold text-sky-700 hover:underline">
          contacto.sv@gmail.com </a
        >.
      </p>
    </div>
  </Dialog>
</template>
