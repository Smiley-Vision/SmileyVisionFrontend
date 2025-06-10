<script setup>
</script>

<template>
    <div class="mx-auto my-16 flex flex-col items-center gap-y-6">
        <div class="text-yellow-500 pi pi-exclamation-triangle" style="font-size: 8rem">
        </div>
        <div class="text-6xl font-bold">
            Error
        </div>
        <div class="text-xl">
            El token no existe o ha expirado.
        </div>
        <RouterLink :to="{ name: 'login' }" class="text-white text-xl px-6 py-4 rounded-xl bg-sky-600 hover:bg-sky-700 shadow-xl">
            Inicio de sesión
        </RouterLink>
    </div>
</template>