<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="my-auto flex w-full flex-col items-center gap-y-6 px-6 py-10 text-center">
    <div
      v-reveal="{ origin: 'zoom', scale: 0.85, duration: 700 }"
      class="flex h-24 w-24 items-center justify-center rounded-full bg-[#eef6fc] shadow-[0_8px_30px_rgba(14,88,128,0.15)]"
    >
      <i class="pi pi-compass text-sky-700" style="font-size: 3rem"></i>
    </div>

    <div
      v-reveal="{ origin: 'up', distance: 24, duration: 760, delay: 100 }"
      class="flex flex-col items-center gap-y-3"
    >
      <span
        class="bg-gradient-to-b from-sky-700 to-sky-900 bg-clip-text text-[7rem] font-extrabold leading-none text-transparent"
      >
        404
      </span>
      <h1 class="text-3xl font-bold text-sky-900 sm:text-4xl">Página no encontrada</h1>
      <p class="max-w-md text-lg text-slate-500">
        El recurso solicitado no existe, fue movido o la dirección es incorrecta.
      </p>
    </div>

    <RouterLink
      v-reveal="{ origin: 'up', distance: 20, duration: 720, delay: 200 }"
      to="/"
      class="mt-2 flex items-center gap-2 rounded-xl bg-[#075985] px-6 py-3 text-lg font-bold text-white shadow-[0_10px_24px_rgba(7,89,133,0.25)] transition hover:bg-[#0c4a6e] hover:shadow-[0_14px_30px_rgba(7,89,133,0.32)]"
    >
      <i class="pi pi-home"></i>
      Volver al inicio
    </RouterLink>
  </div>
</template>
