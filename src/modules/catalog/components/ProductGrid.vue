<script setup lang="ts">
import type { Product } from '@/modules/catalog/interfaces/Product'
import ProductCard from './ProductCard.vue'

defineProps<{
  products: Product[]
  isLoading: boolean
}>()
</script>

<template>
  <div v-if="isLoading" class="mx-auto my-auto flex flex-col items-center gap-y-8 py-24">
    <div
      class="pi pi-spinner-dotted slow-spin animate-spin text-sky-800"
      style="font-size: 6rem"
    ></div>
    <div class="text-3xl font-bold text-sky-800">Cargando...</div>
  </div>

  <div
    v-else-if="products.length === 0"
    class="flex flex-col items-center gap-y-3 py-24 text-center text-slate-500"
  >
    <i class="pi pi-search" style="font-size: 3rem"></i>
    <div class="text-xl font-semibold text-sky-800">No hay productos con estos filtros</div>
    <div class="text-sm">Prueba a cambiar la categoría, el proveedor o la búsqueda.</div>
  </div>

  <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
    <ProductCard v-for="product in products" :key="product.id" :product="product" />
  </div>
</template>
