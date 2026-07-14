<script setup lang="ts">
import type { Product } from '@/modules/catalog/interfaces/Product'

defineProps<{
  product: Product
}>()

const backendUrl = import.meta.env.VITE_BACKEND_BASE
</script>

<template>
  <RouterLink
    :to="{ name: 'product', params: { code: product.id } }"
    class="group flex flex-col overflow-hidden rounded-xl border-2 border-sky-600 bg-white shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-2xl"
  >
    <div class="flex aspect-square items-center justify-center bg-white p-4">
      <img
        :src="`${backendUrl}/storage/${product.image_path}`"
        :alt="product.name"
        class="size-full object-contain object-center transition duration-200 group-hover:scale-105"
      />
    </div>
    <div class="flex flex-1 flex-col gap-1 border-t border-slate-100 px-4 py-3">
      <div class="line-clamp-1 font-semibold text-sky-800">{{ product.name }}</div>
      <div class="line-clamp-2 text-sm text-slate-600">{{ product.description }}</div>
    </div>
  </RouterLink>
</template>
