<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="mx-auto my-16 flex flex-col items-center gap-y-6">
    <div class="text-yellow-500 pi pi-exclamation-triangle" style="font-size: 8rem"></div>
    <div class="text-6xl font-bold">Error 404</div>
    <div class="text-xl">El recurso solicitado no existe.</div>
    <RouterLink
      to="/"
      class="text-white text-xl px-6 py-4 rounded-xl bg-sky-600 hover:bg-sky-700 shadow-xl"
    >
      Voler al inicio
    </RouterLink>
  </div>
</template>
