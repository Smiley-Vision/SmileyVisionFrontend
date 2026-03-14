<script setup>
import { useAuthStore } from '@/contexts/identity/stores/auth';
import { api } from '@/shared/infrastructure/http/api';
import { useToast } from 'primevue';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuthStore()
const toast = useToast()
const router = useRouter()

const props = defineProps({
    token: String,
    email: String
})

const form = reactive({
    'first_name': '',
    'last_name': '',
    'email': props.email,
    'password': '',
    'phone_number': ''
})

// Submit the registration form
const submitRegistration = async () => {
    try {
        const body = {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            password: form.password,
            phone_number: form.phone_number
        }

        await api.post('register', body)

        // Registration successful. Mark the registration token as used
        await api.post('mark-register-token', { token: props.token })

        auth.justRegistered = true
        router.push({ name: 'login', query: { justRegistered: 'true' } })

    } catch (error) {
        const message = error?.errors
            ? error.errors[Object.keys(error.errors)[0]][0]
            : 'No se pudo completar el registro'

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
    <div class="flex items-center justify-center bg-white px-4 pt-14">
        <div class="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-10 flex flex-col gap-y-8">

            <!-- Encabezado -->
            <div class="flex flex-col gap-y-3 text-center">
                <h1 class="text-3xl md:text-4xl font-bold text-sky-800">Registro en el sistema</h1>
                <p class="text-sky-700 text-md md:text-center text-justify md:text-lg max-w-3xl mx-auto">
                    Su solicitud de registro ha sido aceptada. Por favor, llene correctamente el siguiente formulario
                    para poder realizar acciones en el sistema.
                </p>
            </div>

            <!-- Formulario -->
            <form @submit.prevent="submitRegistration" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Columna 1 -->
                <div class="flex flex-col gap-y-6">
                    <!-- Nombre -->
                    <div class="flex flex-col gap-y-1">
                        <label for="first_name" class="font-medium text-lg text-gray-700">Nombre:</label>
                        <input v-model="form.first_name" type="text" id="first_name" name="first_name"
                            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Ingrese su nombre" required />
                    </div>

                    <!-- Apellido -->
                    <div class="flex flex-col gap-y-1">
                        <label for="last_name" class="font-medium text-lg text-gray-700">Apellido:</label>
                        <input v-model="form.last_name" type="text" id="last_name" name="last_name"
                            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Ingrese su apellido" required />
                    </div>

                    <!-- Correo electrónico -->
                    <div class="flex flex-col gap-y-1">
                        <label for="email" class="font-medium text-lg text-gray-700">Correo electrónico:</label>
                        <input v-model="form.email" type="email" id="email" name="email" disabled
                            class="w-full p-3 border rounded-md bg-gray-100 cursor-not-allowed focus:outline-none"
                            required />
                    </div>

                    <!-- Contraseña -->
                    <div class="flex flex-col gap-y-1">
                        <label for="password" class="font-medium text-lg text-gray-700">Contraseña:</label>
                        <input v-model="form.password" type="password" id="password" name="password"
                            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Ingrese su contraseña" required />
                    </div>
                </div>

                <!-- Columna 2 -->
                <div class="flex flex-col gap-y-6">
                    <!-- Teléfono -->
                    <div class="flex flex-col gap-y-1">
                        <label for="phone" class="font-medium text-lg text-gray-700">Teléfono:</label>
                        <input v-model="form.phone_number" type="tel" id="phone" name="phone"
                            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Ingrese su número" required />
                    </div>
                </div>

                <!-- Botón de registro -->
                <div class="lg:col-span-2">
                    <button type="submit"
                        class="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-lg rounded-md transition">
                        Registrarse
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
