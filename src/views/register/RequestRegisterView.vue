<script setup>
import { reactive } from 'vue';

const form = reactive({
    'email': '',
    'message': ''
})

// Submit the registration request
const submitRegistrationRequest = async (email, message) => {

}
</script>

<template>
    <div class="flex flex-col px-20 mt-14 gap-12 2xl:mb-0 mb-12">
        <div class="flex flex-col gap-y-2">
            <div class="font-semibold text-6xl text-sky-800">
                Solicitud de registro
            </div>
            <div class="font-lg text-xl text-sky-800 text-justify max-w-2xl">
                Si eres un óptico, puedes solicitar registrarte al sistema
                para comprar productos. ¡Realiza tu solicitud ahora!
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
</template>