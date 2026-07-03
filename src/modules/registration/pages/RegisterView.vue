<script setup>
import { api } from '@/modules/shared/infrastructure/http/api'
import { useToast } from 'primevue'
import { onMounted, ref } from 'vue'

const toast = useToast()

const isLoading = ref(true)
const registrationRequests = ref([])
const processingRequestIds = ref(new Set())

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const isRequestProcessing = (id) => {
  return processingRequestIds.value.has(id)
}

const startProcessingRequest = (id) => {
  if (isRequestProcessing(id)) {
    return false
  }

  processingRequestIds.value = new Set(processingRequestIds.value).add(id)
  return true
}

const stopProcessingRequest = (id) => {
  const nextProcessingRequestIds = new Set(processingRequestIds.value)
  nextProcessingRequestIds.delete(id)
  processingRequestIds.value = nextProcessingRequestIds
}

const deleteRequest = async (id) => {
  await api.delete(`register-requests/${id}`)

  // Remove the rejected request from the list
  registrationRequests.value = registrationRequests.value.filter((request) => request.id !== id)
}

const acceptRequest = async (id) => {
  if (!startProcessingRequest(id)) {
    return
  }

  try {
    toast.add({
      severity: 'info',
      summary: 'Atención',
      detail: 'Espere un segundo...',
      life: 2000,
    })

    // Get the request associated with the ID
    const registrationRequest = (await api.get(`register-requests/${id}`)).data
    const email = registrationRequest.email

    // POST request body
    const body = { email }

    // Accept the request
    await api.post('send-register-mail', body)

    // Delete the request when accepted
    await deleteRequest(id)

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Correo enviado',
      life: 4000, // 4 seconds
    })
  } catch (error) {
    // Show the first validation error
    const firstField = Object.keys(error.errors)[0]
    const message = error.errors[firstField][0]

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 4000,
    })
  } finally {
    stopProcessingRequest(id)
  }
}

const rejectRequest = async (id) => {
  if (!startProcessingRequest(id)) {
    return
  }

  try {
    await deleteRequest(id)
  } catch (error) {
    throw error
  } finally {
    stopProcessingRequest(id)
  }
}

// Retrieve the pending registration requests
onMounted(async () => {
  try {
    registrationRequests.value = (await api.get('register-requests')).data
    isLoading.value = false
  } catch (error) {
    throw error
  }
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

  <!-- Content -->
  <div
    v-else
    class="flex flex-col xl:px-20 md:px-12 px-8 px-14 lg:mt-14 lg:py-0 md:py-10 py-8 lg:gap-y-10 gap-y-6"
  >
    <!-- Descriptive title -->
    <h1 class="lg:text-4xl sm:text-3xl text-2xl font-bold text-sky-800">Solicitudes de registro</h1>

    <!-- Registration requests list -->
    <div v-if="registrationRequests.length > 0" class="grid gap-4 max-w-3xl mx-auto w-full">
      <div
        v-for="request in registrationRequests"
        :key="request.id"
        class="border border-gray-200 rounded-xl p-6 shadow-sm bg-white flex flex-col md:flex-row md:items-center md:justify-between transition duration-200 hover:shadow-md"
      >
        <div class="space-y-1">
          <div class="font-medium text-gray-900 text-lg">{{ request.email }}</div>
          <div class="text-gray-600 text-sm">{{ request.message }}</div>
          <div class="text-gray-400 text-xs mt-1">
            Solicitado: {{ formatDate(request.created_at) }}
          </div>
        </div>

        <div class="mt-4 md:mt-0 flex gap-3">
          <button
            @click="acceptRequest(request.id)"
            :disabled="isRequestProcessing(request.id)"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-green-600"
          >
            Aceptar
          </button>
          <button
            @click="rejectRequest(request.id)"
            :disabled="isRequestProcessing(request.id)"
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-red-600"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>

    <div v-else class="max-w-3xl mx-auto w-full px-8 pb-12 text-center">
      <div class="text-2xl font-semibold text-sky-800">No hay solicitudes aún.</div>
      <div class="mt-2 text-sky-600">
        Cuando llegue una nueva solicitud de registro, aparecerá aquí.
      </div>
    </div>
  </div>

  <Toast position="bottom-right" />
</template>
