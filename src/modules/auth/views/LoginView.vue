<script setup>
import { useToast } from 'primevue'
import { reactive } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { firstProblemMessage } from '@/modules/core/api/apiProblem.ts'
import { useAuthStore } from '@/modules/core/stores/auth.ts'

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const submitLogin = async () => {
  try {
    await auth.login(form.email, form.password)
    router.push({ name: 'home', query: { justLoggedIn: 'true' } })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: firstProblemMessage(error),
      life: 4000,
    })
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
      <form @submit.prevent="submitLogin" class="flex flex-col gap-y-6">
        <div class="flex flex-col gap-y-1">
          <label for="email" class="font-medium text-lg text-gray-700">Correo electrónico:</label>
          <input
            v-model="form.email"
            type="email"
            id="email"
            name="email"
            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ingresa tu correo electrónico"
            required
          />
        </div>

        <div class="flex flex-col gap-y-1">
          <label for="password" class="font-medium text-lg text-gray-700">Contraseña:</label>
          <input
            v-model="form.password"
            type="password"
            id="password"
            name="password"
            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full px-4 py-3 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  </div>
</template>
