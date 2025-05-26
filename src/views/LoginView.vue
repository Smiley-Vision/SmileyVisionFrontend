<script setup>
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue';
import { reactive } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const toast = useToast()
const auth = useAuthStore()
const router = useRouter()

const form = reactive({
    email: '',
    password: ''
})

const submitLogin = async () => {
    try {
        const data = await auth.login(form.email, form.password)
        router.push({name: 'home'})
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Credenciales incorrectas',
            life: 4000 // 4 seconds
        })
    }
}
</script>

<template>
    <div class="flex flex-col px-20 mt-14 gap-12 2xl:mb-0 mb-12">
        <div class="flex flex-col gap-y-2">
            <div class="font-semibold text-6xl text-sky-800">
                Inicio de sesión
            </div>
            <div class="font-lg text-xl text-sky-800">
                ¿No tienes una cuenta?
                <RouterLink
                    to="/register"
                    class="text-sky-500 hover:underline"
                >Regístrate</RouterLink>
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
    </div>
</template>