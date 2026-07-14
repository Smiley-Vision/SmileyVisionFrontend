<script setup>
import { useRouter } from 'vue-router'

import { useAppToast } from '@/modules/core/composables/useAppToast'
import { useAuthStore } from '@/modules/core/stores/auth'
import { useRegistrationRequestForm } from '@/modules/registration/composables/useRegistrationRequestForm'

const auth = useAuthStore()
const notify = useAppToast()
const router = useRouter()
const { apiError, clearFeedback, errors, form, isSubmitting, submit } = useRegistrationRequestForm()

// Submit the registration request
const submitRegistrationRequest = async () => {
  const wasSuccessful = await submit()

  if (wasSuccessful) {
    auth.justSubmittedRequest = true
    router.push({ name: 'home', query: { justSubmittedRequest: 'true' } })
    return
  }

  if (apiError.value) {
    notify('error', 'Error', apiError.value)
  }
}
</script>

<template>
  <div class="mt-14 md:mb-0 mb-14 flex items-center justify-center bg-white px-4">
    <div class="flex flex-col gap-y-8 p-10 rounded-2xl shadow-2xl bg-white w-full max-w-md">
      <!-- Title and subtitle -->
      <div class="flex flex-col gap-y-2 text-center">
        <h1 class="font-bold text-3xl text-sky-800">Solicitud de registro</h1>
        <p class="text-sky-700 text-lg">
          ¿Ya tienes una cuenta?
          <RouterLink to="/login" class="text-sky-500 hover:underline"> Inicia sesión </RouterLink>
        </p>
      </div>

      <!-- Request register form -->
      <form @submit.prevent="submitRegistrationRequest" class="flex flex-col gap-y-6">
        <div class="flex flex-col gap-y-1">
          <label for="email" class="font-medium text-lg text-gray-700">Correo electrónico:</label>
          <input
            v-model="form.email"
            type="email"
            id="email"
            name="email"
            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ingresa tu correo electrónico"
            @input="clearFeedback('email')"
          />
          <p v-if="errors.email" class="mt-2 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <div class="flex flex-col gap-y-1">
          <label for="message" class="font-medium text-lg text-gray-700"
            >Descripción de tu negocio:</label
          >
          <textarea
            v-model="form.message"
            id="message"
            name="message"
            rows="4"
            class="w-full resize-none p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ingresa los detalles de su óptica para la verificación del negocio."
            @input="clearFeedback('message')"
          ></textarea>
          <p v-if="errors.message" class="mt-2 text-sm text-red-600">{{ errors.message }}</p>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full px-4 py-3 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700"
        >
          {{ isSubmitting ? 'Enviando...' : 'Solicitar registro' }}
        </button>
      </form>

      <!-- Toast -->
      <Toast position="bottom-right" />
    </div>
  </div>
</template>
