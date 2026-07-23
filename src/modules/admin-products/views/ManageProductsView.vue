<script setup lang="ts">
import AdminProductActionIcon from '../components/AdminProductActionIcon.vue'

const actions = [
  { label: 'Crear producto', route: 'create', variant: 'create' },
  { label: 'Editar producto', route: 'modify', variant: 'modify' },
  { label: 'Inventario', route: 'availability', variant: 'availability' },
]
</script>

<template>
  <div class="flex flex-col lg:px-32 px-6 lg:py-10 py-6 lg:gap-y-10 gap-y-6">
    <!-- Title and description -->
    <div class="flex flex-col gap-y-12">
      <h1 class="md:text-5xl text-4xl lg:text-start text-center font-bold text-sky-800 -mb-4">
        Administración de productos
      </h1>
      <p class="text-lg font-medium text-sky-800 lg:text-start text-center">
        Elija la acción que desea realizar sobre los productos.
      </p>
    </div>

    <!-- Content -->
    <div
      class="flex sm:flex-row xl:gap-x-36 lg:gap-x-22 sm:gap-x-20 flex-col gap-y-12 max-w-full mx-auto my-auto pt-4"
    >
      <div v-for="action in actions" :key="action.route" class="min-w-2xl rounded-xl">
        <div class="flex flex-col items-center gap-y-4 max-w-sm max-h-sm">
          <RouterLink
            :to="{ name: `admin-products-${action.route}` }"
            class="lg:size-52 size-36 border-solid border-4 border-sky-600 rounded-xl shadow-lg p-6 bg-white/80 hover:shadow-2xl transform transition duration-200 hover:scale-105"
          >
            <AdminProductActionIcon :variant="action.variant" />
          </RouterLink>
          <div
            class="font-semibold items-center lg:text-3xl md:text-2xl text-xl text-sky-800 text-center"
          >
            {{ action.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
