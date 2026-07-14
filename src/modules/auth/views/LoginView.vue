<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { RouterLink, useRouter } from 'vue-router'

import { firstProblemMessage, type ApiProblemDetails } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import { useAuthStore } from '@/modules/core/stores/auth'

import { loginSchema, type LoginFormValues } from '../schemas/login'

const notify = useAppToast()
const auth = useAuthStore()
const router = useRouter()

const resolver = zodResolver(loginSchema)

const initialValues: LoginFormValues = {
  email: '',
  password: '',
}

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return

  const values = event.values as LoginFormValues

  try {
    await auth.login(values.email, values.password)
    router.push({ name: 'home', query: { justLoggedIn: 'true' } })
  } catch (error) {
    notify('error', 'Error', firstProblemMessage(error as ApiProblemDetails))
  }
}
</script>

<template>
  <div class="mt-14 md:mb-0 mb-14 flex items-center justify-center bg-white px-4">
    <div class="flex flex-col gap-y-8 p-10 rounded-2xl shadow-2xl bg-white w-full max-w-md">
      <!-- Title and subtitle -->
      <div class="flex flex-col gap-y-2 text-center">
        <h1 class="font-bold text-3xl text-sky-800">Inicio de sesión</h1>
        <p class="text-sky-700 text-lg">
          ¿No tienes una cuenta?
          <RouterLink to="/register" class="text-sky-500 hover:underline">
            Solicita una
          </RouterLink>
        </p>
      </div>

      <!-- Login form -->
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
          <label for="password" class="font-medium text-lg text-gray-700">Contraseña:</label>
          <Password
            id="password"
            name="password"
            placeholder="Ingresa tu contraseña"
            :feedback="false"
            toggle-mask
            fluid
          />
          <Message v-if="$form.password?.invalid" severity="error" size="small">
            {{ $form.password.error?.message }}
          </Message>
        </div>

        <Button type="submit" label="Iniciar sesión" class="w-full" size="large" />
      </Form>
    </div>
  </div>

  <Toast position="bottom-right" />
</template>
