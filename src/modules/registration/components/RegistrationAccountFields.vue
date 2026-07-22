<script setup lang="ts">
import { FormField } from '@primevue/forms'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'

withDefaults(
  defineProps<{
    isEmailLocked?: boolean
  }>(),
  {
    isEmailLocked: false,
  },
)
</script>

<template>
  <FormField v-slot="$field" name="registration_token" class="flex flex-col gap-2">
    <label for="registration_token" class="font-semibold text-slate-800">Token de registro</label>
    <InputText id="registration_token" placeholder="Ingrese el token enviado a su correo" fluid />
    <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
  </FormField>

  <FormField v-slot="$field" name="first_name" class="flex flex-col gap-2">
    <label for="first_name" class="font-semibold text-slate-800">Nombres</label>
    <InputText id="first_name" placeholder="Ingrese sus nombres" fluid />
    <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
  </FormField>

  <FormField v-slot="$field" name="last_name" class="flex flex-col gap-2">
    <label for="last_name" class="font-semibold text-slate-800">Apellidos</label>
    <InputText id="last_name" placeholder="Ingrese sus apellidos" fluid />
    <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
  </FormField>

  <FormField v-slot="$field" name="email" class="flex flex-col gap-2">
    <label for="email" class="font-semibold text-slate-800">Correo Electrónico</label>
    <InputText
      id="email"
      :disabled="isEmailLocked"
      placeholder="Ingrese su correo electrónico"
      fluid
    />
    <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
  </FormField>

  <FormField v-slot="$field" name="phone_number" class="flex flex-col gap-2">
    <label for="phone_number" class="font-semibold text-slate-800">Teléfono</label>
    <InputText id="phone_number" placeholder="10 dígitos (opcional)" fluid />
    <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
  </FormField>

  <FormField v-slot="$field" name="password" class="flex flex-col gap-2">
    <label for="password" class="font-semibold text-slate-800">Contraseña</label>
    <Password
      id="password"
      placeholder="Mínimo 6 caracteres"
      :feedback="false"
      toggle-mask
      fluid
    />
    <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
  </FormField>

  <FormField v-slot="$field" name="password_confirmation" class="flex flex-col gap-2">
    <label for="password_confirmation" class="font-semibold text-slate-800"
      >Confirmar contraseña</label
    >
    <Password
      id="password_confirmation"
      placeholder="Repita su contraseña"
      :feedback="false"
      toggle-mask
      fluid
    />
    <Message v-if="$field.invalid" severity="error" size="small">{{
      $field.error?.message
    }}</Message>
  </FormField>
</template>
