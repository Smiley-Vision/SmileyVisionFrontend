<script setup>
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue';
import { onMounted } from 'vue';
import { reactive } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()
const router = useRouter()

const form = reactive({
    email: '',
    password: ''
})

const submitLogin = async () => {
    try {
        await auth.login(form.email, form.password)
        router.push({ name: 'home', query: { justLoggedIn: 'true' }})
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

onMounted(() => {
    if (route.query.justRegistered === 'true') {
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Registro exitoso. Puede iniciar sesión',
            life: 4000 // 4 seconds
        })
    }

    auth.justRegistered = false
})
</script>

<template>
    <div class="flex flex-col px-20 mt-14 gap-12 2xl:mb-0 mb-12">
        <div class="flex flex-col gap-y-4">
            <div class="font-semibold xl:text-6xl text-4xl text-sky-800">
                Inicio de sesión
            </div>
            <div class="font-lg text-xl text-sky-800">
                ¿No tienes una cuenta?
                <RouterLink
                    to="/register"
                    class="text-sky-500 hover:underline"
                >Solicita una</RouterLink>
            </div>
        </div>
        <div class="flex flex-col gap-y-8">
            <form @submit.prevent="submitLogin">
                <div class="flex flex-col gap-y-1">
                    <label for="email" class="font-medium text-lg text-gray-700">Correo electrónico:</label>
                    <input 
                        v-model="form.email" type="email" id="email" name="email"
                        class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-xs"
                        placeholder="Ingresa tu correo electrónico" required
                    >
                </div>
                <div class="flex flex-col gap-y-1">
                    <label for="password" class="font-medium text-lg text-gray-700">Contraseña:</label>
                    <input 
                        v-model="form.password" type="password" id="password" name="password" 
                        class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-xs"
                        placeholder="Ingresa tu contraseña" required
                    >
                </div>
                <button 
                    type="submit" 
                    class="px-4 py-2 mt-4 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 max-w-xs"
                >
                    Iniciar sesión
                </button>
            </form>
        </div>

        <!-- Toast -->
        <Toast position="bottom-right"/>
    </div>
</template>