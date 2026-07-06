<script setup>
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputMask from 'primevue/inputmask'
import InputText from 'primevue/inputtext'

defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
  email: {
    type: String,
    default: '',
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
    :style="{ width: '36rem' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="text-[#075985] font-semibold">Editar información</div>
    </template>
    <form class="flex flex-col gap-4" @submit.prevent="$emit('submit')">
      <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
        <div class="flex flex-col gap-1">
          <label for="first_name">Nombre</label>
          <InputText id="first_name" v-model="form.first_name" required />
        </div>
        <div class="flex flex-col gap-1">
          <label for="last_name">Apellido</label>
          <InputText id="last_name" v-model="form.last_name" required />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="phone_number">Teléfono</label>
        <InputMask
          id="phone_number"
          v-model="form.phone_number"
          mask="9999999999"
          :unmask="true"
          required
        />
      </div>

      <div class="flex flex-col gap-1">
        <label>Correo electrónico</label>
        <InputText :model-value="email" disabled />
      </div>

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
