<script setup>
import { useAuthStore } from '@/contexts/identity/stores/auth';
import { fetchData } from '@/shared/infrastructure/http/api';
import { useToast } from 'primevue';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuthStore()
const toast = useToast()
const router = useRouter()

const form = reactive({
    'email': '',
    'message': ''
})

// Submit the registration request
const submitRegistrationRequest = async () => {
    try {
        const body = {
            email: form.email,
            message: form.message
        }

        await fetchData('register-requests', 'POST', body)

        auth.justSubmittedRequest = true
        router.push({ name: 'home', query: { justSubmittedRequest: 'true' } })
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
</script>

<template>
    <div class="mt-14 md:mb-0 mb-14 flex items-center justify-center bg-white px-4">
        <div class="flex flex-col gap-y-8 p-10 rounded-2xl shadow-2xl bg-white w-full max-w-md">

            <!-- Title and subtitle -->
            <div class="flex flex-col gap-y-2 text-center">
                <h1 class="font-bold text-3xl text-sky-800">Solicitud de registro</h1>
                <p class="text-sky-700 text-lg">
                    ¿Ya tienes una cuenta?
                    <RouterLink to="/login" class="text-sky-500 hover:underline">
                        Inicia sesión
                    </RouterLink>
                </p>
            </div>

            <!-- Request register form -->
            <form @submit.prevent="submitRegistrationRequest" class="flex flex-col gap-y-6">
                <div class="flex flex-col gap-y-1">
                    <label for="email" class="font-medium text-lg text-gray-700">Correo electrónico:</label>
                    <input v-model="form.email" type="email" id="email" name="email"
                        class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Ingresa tu correo electrónico" required />
                </div>

                <div class="flex flex-col gap-y-1">
                    <label for="message" class="font-medium text-lg text-gray-700">Descripción:</label>
                    <input 
                        v-model="form.message" type="text" id="message" name="message" 
                        class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Al menos 10 caracteres" required />
                </div>

                <button type="submit"
                    class="w-full px-4 py-3 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700">
                    Solicitar registro
                </button>
            </form>

            <!-- Toast -->
            <Toast position="bottom-right" />
        </div>
    </div>
</template>
