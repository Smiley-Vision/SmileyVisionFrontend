<script setup>
import { useAuthStore } from '@/stores/auth';
import { fetchData } from '@/utils/api';
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

        const data = await fetchData('register-requests', 'POST', body)

        if (data.message === "Success") {
            auth.justSubmittedRequest = true
            router.push({ name: 'home' })
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Por favor, llene correctamente los campos',
            life: 4000 // 4 seconds
        })
    }
}
</script>

<template>
    <div class="flex flex-col px-20 mt-14 gap-12 2xl:mb-0 mb-12">
        <div class="flex flex-col gap-y-2">
            <div class="font-semibold text-6xl text-sky-800">
                Solicitud de registro
            </div>
            <div class="font-lg text-xl text-sky-800 text-justify max-w-2xl">
                Si eres un óptico, puedes solicitar registrarte al sistema.
                En caso de aceptar tu solicitud, se te enviará un enlace
                para el registro a tu correo, a la brevedad.
                <span class="font-medium">
                    ¿Ya tienes cuenta?
                    <RouterLink
                        to="/login"
                        class="text-sky-500 hover:underline"
                    >Inicia sesión</RouterLink>
                </span>
            </div>
        </div>
        <form @submit.prevent="submitRegistrationRequest">
            <div class="flex flex-col gap-y-1">
                <label for="email" class="font-medium text-lg text-gray-700">Correo electrónico:</label>
                <input 
                    v-model="form.email" type="email" id="email" name="email"
                    class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-xs"
                    placeholder="Ingresa tu correo electrónico" required
                >
            </div>
            <div class="flex flex-col gap-y-1">
                <label for="message" class="font-medium text-lg text-gray-700">Descripción:</label>
                <input 
                    v-model="form.message" type="text" id="message" name="message" 
                    class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-xs"
                    placeholder="Al menos 10 caracteres" required
                >
            </div>
            <button 
                type="submit" 
                class="px-4 py-2 mt-4 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 max-w-xs"
            >
                Solicitar registro
            </button>
        </form>
        <Toast position="bottom-right"/>
    </div>
</template>