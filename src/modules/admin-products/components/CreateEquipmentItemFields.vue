<script setup lang="ts">
import { FormField } from '@primevue/forms'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
</script>

<template>
  <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
    <FormField v-slot="$field" name="sku" class="flex flex-col gap-1">
      <label for="sku" class="font-medium text-sky-700">SKU</label>
      <InputText id="sku" fluid />
      <Message v-if="$field.invalid" severity="error" size="small">{{
        $field.error?.message
      }}</Message>
    </FormField>

    <FormField v-slot="$field" name="price" class="flex flex-col gap-1">
      <label for="price" class="font-medium text-sky-700">Precio</label>
      <InputNumber
        input-id="price"
        mode="currency"
        currency="MXN"
        locale="es-MX"
        :min="0"
        fluid
      />
      <Message v-if="$field.invalid" severity="error" size="small">{{
        $field.error?.message
      }}</Message>
    </FormField>
  </div>
</template>
