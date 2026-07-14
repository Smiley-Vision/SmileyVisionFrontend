<script setup lang="ts">
import Button from 'primevue/button'

import { formatPrice } from '@/modules/core/utils/formatPrice'
import type { CartItem } from '@/modules/user/interfaces/Cart'
import {
  getCartItemImageSrc,
  getDisplayCode,
  getLensDetails,
  getStockStatus,
  getVariationDetails,
} from '@/modules/user/utils/cart'

const { item, isSyncing } = defineProps<{
  item: CartItem
  isSyncing: boolean
}>()

const emit = defineEmits<{
  increase: [item: CartItem]
  decrease: [item: CartItem]
  remove: [item: CartItem]
}>()

function formatLensValue(value: number): string {
  return value.toFixed(2)
}

function variationOptionKey(variationOptionIndex: number): string {
  const variationOption = item.variation_options[variationOptionIndex]
  return `${item.product_item_id}-${variationOption.variation_id}-${variationOption.option_id}`
}
</script>

<template>
  <article class="py-5 grid md:grid-cols-[7.5rem_1fr_auto] gap-4">
    <img
      :src="getCartItemImageSrc(item)"
      alt="Producto del carrito"
      class="w-[7.5rem] h-[7.5rem] object-contain object-center rounded-xl border border-slate-200 bg-white"
    />

    <div class="flex flex-col gap-2">
      <div class="text-xl font-semibold text-sky-800">{{ item.name }}</div>
      <div class="text-slate-600 text-sm leading-relaxed line-clamp-2">
        {{ item.description || 'Sin descripción disponible.' }}
      </div>

      <div
        v-if="getLensDetails(item)"
        class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600"
      >
        <span>
          <span class="font-semibold text-sky-800">Esfera:</span>
          {{ formatLensValue(getLensDetails(item)!.sphere) }}
        </span>
        <span>
          <span class="font-semibold text-sky-800">Cilindro:</span>
          {{ formatLensValue(getLensDetails(item)!.cylinder) }}
        </span>
      </div>

      <div
        v-if="getVariationDetails(item).length > 0"
        class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600"
      >
        <span
          v-for="(variationOption, index) in getVariationDetails(item)"
          :key="variationOptionKey(index)"
        >
          <span class="font-semibold text-sky-800">{{ variationOption.variation_name }}:</span>
          {{ variationOption.option_value }}
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-3 mt-1">
        <span
          :class="[
            'text-xs font-semibold px-3 py-1 rounded-full',
            getStockStatus(item).className,
          ]"
        >
          {{ getStockStatus(item).label }}
        </span>
        <span class="text-sm text-slate-600">Código: {{ getDisplayCode(item) }}</span>
      </div>

      <div class="flex items-center gap-2 mt-2">
        <Button
          icon="pi pi-minus"
          text
          rounded
          class="!w-8 !h-8 !border !border-sky-800 !text-sky-800"
          :disabled="isSyncing || item.quantity <= 1"
          @click="emit('decrease', item)"
        />
        <span class="font-semibold text-slate-600 min-w-8 text-center">{{ item.quantity }}</span>
        <Button
          icon="pi pi-plus"
          text
          rounded
          class="!w-8 !h-8 !border !border-sky-800 !text-sky-800"
          :disabled="isSyncing || item.stock <= item.quantity"
          @click="emit('increase', item)"
        />
      </div>
    </div>

    <div class="flex md:flex-col flex-row items-center items-end justify-between gap-4">
      <div class="font-bold md:text-3xl text-xl text-sky-800 whitespace-nowrap">
        ${{ formatPrice(item.price * item.quantity) }} MXN
      </div>
      <Button
        label="Eliminar"
        icon="pi pi-trash"
        text
        severity="danger"
        class="!text-red-600"
        :disabled="isSyncing"
        @click="emit('remove', item)"
      />
    </div>
  </article>
</template>
