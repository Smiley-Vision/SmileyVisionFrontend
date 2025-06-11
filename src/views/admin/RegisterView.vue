<script setup>
import { fetchData } from '@/utils/api';
import { useToast } from 'primevue';
import { onMounted, ref } from 'vue';

const toast = useToast()

const registrationRequests = ref([])

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
}

const acceptRequest = async (id) => {
    try {
        toast.add({
            severity: 'info',
            summary: 'Atención',
            detail: 'Espere un segundo...',
            life: 2000
        })

        // Get the request associated with the ID
        const registrationRequest = await fetchData(`register-requests/${id}`, 'GET')
        const email = registrationRequest.email
        
        // POST request body
        const body = { email }

        // Accept the request 
        await fetchData('send-register-mail', 'POST', body)

        // Delete the request when accepted
        await rejectRequest(id)

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Correo enviado',
            life: 4000 // 4 seconds
        })
    } catch (error) {
        // Show the first validation error
        const firstField = Object.keys(error.errors)[0]
        const message = error.errors[firstField][0]

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 4000
        })
    }
}

const rejectRequest = async (id) => {
    try {
        const response = await fetchData(`register-requests/${id}`, 'DELETE')
        console.log(response);

        // Remove the rejected request from the list
        registrationRequests.value = registrationRequests.value.filter(request => request.id !== id)
    } catch (error) {
        throw error
    }
}

// Retrieve the pending registration requests
onMounted(async () => {
    try {
        registrationRequests.value = await fetchData('register-requests', 'GET')
        console.log(registrationRequests)
    } catch (error) {
        throw error
    }
})
</script>

<template>
    <div class="grid gap-4 max-w-4xl mx-auto p-4">
        <div v-for="request in registrationRequests" :key="request.id"
            class="border rounded-lg p-4 shadow-md bg-white flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <div class="font-semibold text-gray-800">{{ request.email }}</div>
                <div class="text-gray-600 text-sm">{{ request.message }}</div>
                <div class="text-gray-400 text-xs mt-1">Solicitado: {{ formatDate(request.created_at) }}</div>
            </div>
            <div class="mt-3 md:mt-0 flex gap-2">
                <button @click="acceptRequest(request.id)"
                    class="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">Aceptar</button>
                <button @click="rejectRequest(request.id)"
                    class="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700">Rechazar</button>
            </div>
        </div>
    </div>
    <Toast position="bottom-right"/>
</template>