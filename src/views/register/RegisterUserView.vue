<script setup>
import { fetchData } from '@/utils/api';
import { useToast } from 'primevue';
import { onMounted } from 'vue';
import { reactive } from 'vue';

const toast = useToast()

const props = defineProps(['token', 'email'])

const form = reactive({
    'name': '',
    'email': '',
    'phone': '',
    'password': '',
    'role_id': 2,
    'store_id': 0,
})

const roles = ['Óptico', 'Conductor']
const stores = []

// Retrieve the available stores as an array
const retrieveStores = async () => {
    try {
        const response = JSON.stringify(await fetchData('get-stores', 'GET'))
        const data = JSON.parse(response)
       
        data.forEach(store => { stores.push(store['name']) })
        
        console.log(props.token);
        console.log(props.email);
        
    } catch (error) {
        throw error
    }
}

// Submit the registration form
const submitRegistration = async (name, email, phone, password, role_id, store_id) => {
    try {
        
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
    <div class="flex flex-col px-20 mt-14 gap-12 2xl:mb-0 mb-12">
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
                    v-model="form.password" type="text" id="message" name="message" 
                    class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-xs"
                    placeholder="Describe tu solicitud" required
                >
            </div>
            <button 
                type="submit" 
                class="px-4 py-2 mt-4 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 max-w-xs"
            >
                Solicitar registro
            </button>
        </form>
    </div>
    <!-- Toast -->
    <Toast position="bottom-right"/>
</template>