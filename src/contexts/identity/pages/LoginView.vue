<script setup>
import { useAuthStore } from '@/contexts/identity/stores/auth';
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
        router.push({ name: 'home', query: { justLoggedIn: 'true' } })
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
                    <input v-model="form.email" type="email" id="email" name="email"
                        class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Ingresa tu correo electrónico" required />
                </div>

                <div class="flex flex-col gap-y-1">
                    <label for="password" class="font-medium text-lg text-gray-700">Contraseña:</label>
                    <input v-model="form.password" type="password" id="password" name="password"
                        class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Ingresa tu contraseña" required />
                </div>

                <button type="submit"
                    class="w-full px-4 py-3 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700">
                    Iniciar sesión
                </button>
            </form>

            <!-- Toast -->
            <Toast position="bottom-right" />
        </div>
    </div>
</template>
