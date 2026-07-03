<script setup></script>

<template>
  <div class="w-2/3 mx-auto my-16 flex flex-col items-center gap-y-6">
    <div class="text-yellow-500 pi pi-exclamation-triangle" style="font-size: 8rem"></div>
    <div class="text-6xl font-bold">Error</div>
    <div
      class="font-medium md:text-center text-justify md:text-xl text-lg text-center text-sky-800 max-w-lg"
    >
      El token no existe, ha expirado, o usted no tiene permiso para acceder a este formulario.
    </div>
    <RouterLink
      :to="{ name: 'login' }"
      class="text-white text-xl px-6 py-4 rounded-xl bg-sky-600 hover:bg-sky-700 shadow-xl"
    >
      Inicio de sesión
    </RouterLink>
  </div>
</template>
