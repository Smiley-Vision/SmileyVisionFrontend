<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Button from 'primevue/button'
import { useRoute } from 'vue-router'

import AddressFormFields from '@/modules/user/components/AddressFormFields.vue'
import { useCityCatalog } from '@/modules/user/composables/useCityCatalog'

import RegistrationAccountFields from '../components/RegistrationAccountFields.vue'
import { useSignUpSubmit } from '../composables/useSignUpSubmit'
import { type RegistrationFormValues, registrationFormSchema } from '../schemas/registrationForm'
import { createRegistrationInitialValues } from '../utils/registrationUserForm'

const route = useRoute()
const { cityOptions } = useCityCatalog()
const { isSubmitting, submitSignUp } = useSignUpSubmit()

const resolver = zodResolver(registrationFormSchema)

const invitationEmail = typeof route.query.email === 'string' ? route.query.email : ''
const invitationToken = typeof route.query.token === 'string' ? route.query.token : ''
const isEmailFromInvitation = invitationEmail.length > 0

const initialValues = createRegistrationInitialValues({
  registrationToken: invitationToken,
  email: invitationEmail,
})

function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return

  submitSignUp(event.values as RegistrationFormValues)
}
</script>

<template>
  <div class="flex items-center justify-center bg-slate-100 px-4 py-12">
    <div
      class="w-full max-w-2xl overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl"
    >
      <!-- Encabezado -->
      <div class="px-6 py-8 sm:px-10">
        <h1 class="text-3xl font-bold text-sky-900">Registro en el sistema</h1>
        <p class="mt-3 text-base leading-7 text-slate-600">
          Ingresa el token de registro que te enviamos por correo y llena correctamente el siguiente
          formulario para poder realizar acciones en el sistema.
        </p>
      </div>

      <!-- Formulario -->
      <Form
        class="flex flex-col gap-5 border-t border-slate-200 px-6 py-8 sm:px-10"
        :resolver="resolver"
        :initial-values="initialValues"
        @submit="handleSubmit"
      >
        <RegistrationAccountFields :is-email-locked="isEmailFromInvitation" />

        <fieldset class="flex flex-col gap-4 border-t border-slate-200 pt-6">
          <legend class="mb-2 font-semibold text-slate-800">Ubicación</legend>

          <AddressFormFields
            :city-options="cityOptions"
            id-prefix="signup"
            :show-default-option="false"
          />
        </fieldset>

        <div class="pt-2">
          <Button
            type="submit"
            label="Registrarse"
            class="w-full"
            size="large"
            :loading="isSubmitting"
          />
        </div>
      </Form>
    </div>
  </div>
</template>
