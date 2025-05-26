<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
    <div class="flex flex-col px-20 mt-14 gap-12 2xl:mb-0 mb-12">
        <div class="flex flex-col gap-y-2">
            <div class="font-semibold text-6xl text-sky-800">
                Registro
            </div>
            <div class="font-lg text-xl text-sky-800">
                ¿Ya tienes una cuenta?
                <RouterLink
                    to="/login"
                    class="text-sky-500 hover:underline"
                >Inicia sesión</RouterLink>
            </div>
        </div>
        <div class="flex flex-col gap-y-8">
            <form 
                action="http://localhost:5000/api/users"
                method="post"
                class="flex flex-col gap-y-4"
            >
                <div class="flex flex-col gap-y-1">
                    <label for="username" class="font-medium text-lg text-gray-700">Nombre de usuario:</label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-xs"
                        placeholder="Ingresa tu nombre de usuario"
                    >
                </div>
                <div class="flex flex-col gap-y-1">
                    <label for="password" class="font-medium text-lg text-gray-700">Contraseña:</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-xs"
                        placeholder="Ingresa tu contraseña"
                    >
                </div>
                <div class="flex flex-col gap-y-1">
                    <label for="securityCode" class="font-medium text-lg text-gray-700">Código de seguridad:</label>
                    <input 
                        type="password" 
                        id="securityCode" 
                        name="securityCode" 
                        class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-xs"
                        placeholder="Ingresa tu código de seguridad"
                    >
                </div>
                <button 
                    type="submit" 
                    class="px-4 py-2 mt-4 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 max-w-xs"
                >
                    Submit
                </button>
            </form>
        </div>
    </div>
</template>