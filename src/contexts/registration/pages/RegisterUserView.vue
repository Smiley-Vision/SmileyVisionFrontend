<script setup>
import { useAuthStore } from '@/contexts/identity/stores/auth';
import { api } from '@/shared/infrastructure/http/api';
import { useToast } from 'primevue';
import { watch } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
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
    'name': '',
    'email': props.email,
    'password': '',
    'phone': '',
    'role_id': 2,
    'store_id': null,
})

const roles = ['Óptico', 'Conductor']
const stores = ref([])

const selectedRoleIndex = ref(0)
form.role_id = selectedRoleIndex.value + 2

watch(selectedRoleIndex, (newIndex) => {
    form.role_id = newIndex + 2
})

const selectedStoreIndex = ref(0)
form.store_id = selectedRoleIndex.value + 1

watch(selectedStoreIndex, (newIndex) => {
    form.store_id = newIndex + 1
})

// Retrieve the available stores as an array
const retrieveStores = async () => {
    try {
        const response = (await api.get('stores')).data
        stores.value = response.map(store => store['name'])
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al obtener las tiendas',
            life: 4000 // 4 seconds
        })
    }
}

// Submit the registration form
const submitRegistration = async () => {
    try {
        const body = {
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            role_id: form.role_id,
            store_id: form.store_id
        }

        await api.post('register', body)

        // Registration successful. Mark the registration token as used
        await api.post('mark-register-token', { token: props.token })

        auth.justRegistered = true
        router.push({ name: 'login', query: { justRegistered: 'true' } })

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

onMounted(async () => {
    retrieveStores()
})
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
                        <label for="name" class="font-medium text-lg text-gray-700">Nombre completo:</label>
                        <input v-model="form.name" type="text" id="name" name="name"
                            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Ingrese su nombre completo" required />
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
                        <input v-model="form.phone" type="tel" id="phone" name="phone"
                            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Ingrese su número" required />
                    </div>

                    <!-- Rol -->
                    <div class="flex flex-col gap-y-1">
                        <label for="role" class="font-medium text-lg text-gray-700">Tipo de usuario:</label>
                        <select id="role" v-model="selectedRoleIndex"
                            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500">
                            <option v-for="(role, index) in roles" :key="index" :value="index">
                                {{ role }}
                            </option>
                        </select>
                    </div>

                    <!-- Tienda (solo ópticos) -->
                    <div v-if="selectedRoleIndex == 0" class="flex flex-col gap-y-1">
                        <label for="store" class="font-medium text-lg text-gray-700">Tienda asociada:</label>
                        <select id="store" v-model="selectedStoreIndex"
                            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500">
                            <option v-for="(store, index) in stores" :key="index" :value="index">
                                {{ store }}
                            </option>
                        </select>
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
