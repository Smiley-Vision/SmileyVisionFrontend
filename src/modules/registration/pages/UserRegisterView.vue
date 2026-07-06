<script setup>
import { useToast } from 'primevue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useAuthStore } from '@/modules/core/stores/auth'

import InvalidTokenView from './InvalidTokenView.vue'
import RegisterUserView from './RegisterUserView.vue'
import RequestRegisterView from './RequestRegisterView.vue'

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

const isLoading = ref(true)
const token = route.query.token
const isAdmin = auth.isAdmin
const isTokenValid = ref(false)
const email = ref('')

// Check the availability of the URL token
const checkURLToken = async (token) => {
  if (!token) {
    isLoading.value = false
    return
  }

  try {
    const response = JSON.stringify(await auth.checkToken(token))
    const data = JSON.parse(response)

    if (data.message === "Token exists and it's available") {
      isTokenValid.value = true
      email.value = data['email']
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Token inválido o expirado',
      life: 4000, // 4 seconds
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await checkURLToken(token)
})
</script>

<template>
  <!-- Loading screen -->
  <div v-if="isLoading" class="flex flex-col mx-auto my-auto items-center gap-y-8 mt-24">
    <div
      class="text-sky-600 pi pi-spinner-dotted animate-spin slow-spin"
      style="font-size: 8rem"
    ></div>
    <div class="lg:text-5xl text-4xl text-sky-700 font-bold">Cargando...</div>
  </div>

  <div v-else>
    <!-- Valid URL token -->
    <div v-if="isTokenValid && !isAdmin">
      <RegisterUserView :token="token" :email="email"></RegisterUserView>
    </div>

    <!-- Not using a URL token -->
    <div v-else-if="!token">
      <RequestRegisterView></RequestRegisterView>
    </div>

    <!-- Invalid URL token--display an error -->
    <div v-else>
      <InvalidTokenView></InvalidTokenView>
    </div>
  </div>

  <!-- Toast -->
  <Toast position="bottom-right" />
</template>
