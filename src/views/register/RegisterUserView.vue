<script setup>
import { fetchData } from '@/utils/api';
import { useToast } from 'primevue';
import { watch } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { reactive } from 'vue';

const toast = useToast()

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
        const response = await fetchData('get-stores', 'GET')
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

        const data = await fetchData('register', 'POST', body)

        if (data.message === 'User created successfully') {
            // Mark the registration token as used
            await fetchData('mark-register-token', 'POST', { token: props.token })

            toast.add({
                severity: 'success',
                summary: 'Exito',
                detail: 'Usuario registrado correctamente',
                life: 4000 // 4 seconds
            })
        }
        
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Llene los campos correctamente',
            life: 4000 // 4 seconds
        })
    }
}

onMounted(async () => {
    retrieveStores()
})
</script>

<template>
    <div class="flex flex-col px-8 lg:px-24 mt-14 gap-12 2xl:mb-0 mb-12">
        <div class="flex flex-col gap-y-2">
            <div class="font-semibold text-6xl text-sky-800">
                Registro en el sistema
            </div>
            <div class="font-lg text-xl text-sky-800 text-justify max-w-2xl">
                Su solicitud de registro ha sido aceptada. Por favor,
                llene correctamente el siguiente formulario para poder
                realizar acciones en el sistema.
            </div>
        </div>

        <form @submit.prevent="submitRegistration">
            <div class="flex lg:flex-row flex-col gap-x-12 max-w-2xl">
                <!-- Column 1 -->
                <div class="flex flex-col gap-y-6 flex-1">
                    <!-- Name -->
                    <div class="flex flex-col gap-y-1">
                        <label for="name" class="font-medium text-lg text-gray-700">Nombre:</label>
                        <input v-model="form.name" type="text" id="name" name="name"
                            class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Ingrese su nombre y apellido" required>
                    </div>
                    <!-- Email -->
                    <div class="flex flex-col gap-y-1">
                        <label for="email" class="font-medium text-lg text-gray-700">Correo electrónico:</label>
                        <input v-model="form.email" type="email" id="email" name="email"
                            class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Ingrese su correo electrónico" disabled required>
                    </div>
                    <!-- Password -->
                    <div class="flex flex-col gap-y-1">
                        <label for="password" class="font-medium text-lg text-gray-700">Contraseña:</label>
                        <input v-model="form.password" type="password" id="password" name="password"
                            class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Ingrese su contraseña" required>
                    </div>
                </div>

                <!-- Column 2 -->
                <div class="flex flex-col gap-y-6 flex-1">
                    <!-- Phone -->
                    <div class="flex flex-col gap-y-1 lg:pt-0 pt-6">
                        <label for="phone" class="font-medium text-lg text-gray-700">Teléfono:</label>
                        <input v-model="form.phone" type="tel" id="phone" name="phone"
                            class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Ingrese su número" required>
                    </div>
                    <!-- Role -->
                    <div class="flex flex-col gap-y-1">
                        <label for="role" class="font-medium text-lg text-gray-700">Tipo de usuario:</label>
                        <select
                            id="role"
                            v-model="selectedRoleIndex"
                            class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option v-for="(role, index) in roles" :key="index" :value="index">
                                {{ role }}
                            </option>
                        </select>
                    </div>
                    <!-- Store (optometrists only) -->
                    <div v-if="selectedRoleIndex == 0" class="flex flex-col gap-y-1">
                        <label for="store" class="font-medium text-lg text-gray-700">Tienda asociada:</label>
                        <select
                            id="store"
                            v-model="selectedStoreIndex"
                            class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option v-for="(store, index) in stores" :key="index" :value="index">
                                {{ store }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <button type="submit"
                class="px-4 py-2 mt-6 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700">
                Registrarse
            </button>
        </form>
    </div>
    <Toast position="bottom-right" />
</template>