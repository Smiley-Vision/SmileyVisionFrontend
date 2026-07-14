<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { RouterLink, useRouter } from 'vue-router'

import { firstProblemMessage, type ApiProblemDetails } from '@/modules/core/api/apiProblem'
import smileyApi from '@/modules/core/api/smileyApi'
import { useAppToast } from '@/modules/core/composables/useAppToast'

import {
  registrationRequestSchema,
  type RegistrationRequestFormValues,
} from '../schemas/registrationRequest'

const notify = useAppToast()
const router = useRouter()

const resolver = zodResolver(registrationRequestSchema)

const initialValues: RegistrationRequestFormValues = {
  email: '',
  message: '',
}

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return

  const values = event.values as RegistrationRequestFormValues

  try {
    await smileyApi.post('registration-applications', values)
    router.push({ name: 'home', query: { justSubmittedRequest: 'true' } })
  } catch (error) {
    notify('error', 'Error', firstProblemMessage(error as ApiProblemDetails))
  }
}
</script>

<template>
  <div class="flex items-center justify-center bg-slate-100 px-4 py-12">
    <div class="flex flex-col gap-y-8 p-10 rounded-2xl shadow-2xl bg-white w-full max-w-md">
      <!-- Title and subtitle -->
      <div class="flex flex-col gap-y-2 text-center">
        <h1 class="font-bold text-3xl text-sky-800">Solicitud de registro</h1>
        <p class="text-sky-700 text-lg">
          ¿Ya tienes una cuenta?
          <RouterLink :to="{ name: 'login' }" class="text-sky-500 hover:underline">
            Inicia sesión
          </RouterLink>
        </p>
      </div>

      <!-- Request register form -->
      <Form
        v-slot="$form"
        class="flex flex-col gap-y-6"
        :resolver="resolver"
        :initial-values="initialValues"
        @submit="handleSubmit"
      >
        <div class="flex flex-col gap-y-1">
          <label for="email" class="font-medium text-lg text-gray-700">Correo electrónico:</label>
          <InputText id="email" name="email" placeholder="Ingresa tu correo electrónico" fluid />
          <Message v-if="$form.email?.invalid" severity="error" size="small">
            {{ $form.email.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-y-1">
          <label for="message" class="font-medium text-lg text-gray-700"
            >Descripción de tu negocio:</label
          >
          <Textarea
            id="message"
            name="message"
            rows="4"
            class="resize-none"
            placeholder="Ingresa los detalles de su óptica para la verificación del negocio."
            fluid
          />
          <Message v-if="$form.message?.invalid" severity="error" size="small">
            {{ $form.message.error?.message }}
          </Message>
        </div>

        <Button type="submit" label="Solicitar registro" class="w-full" size="large" />
      </Form>
    </div>
  </div>

  <Toast position="bottom-right" />
</template>
