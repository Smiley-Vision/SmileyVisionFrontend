<script setup lang="ts">
import Button from 'primevue/button'

import Spinner from '@/modules/core/components/Spinner.vue'
import { formatPrice } from '@/modules/core/utils/formatPrice'
import { useCheckout } from '@/modules/orders/composables/useCheckout'
import CartItemCard from '@/modules/user/components/CartItemCard.vue'
import { useCartView } from '@/modules/user/composables/useCartView'

const {
  isLoading,
  itemRows,
  subtotal,
  total,
  hasItems,
  itemCount,
  isSyncing,
  addressLine,
  addressLocation,
  addressMapUrl,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  goToProfile,
  goToShop,
} = useCartView()

const { isSubmitting, stockIssues, submit } = useCheckout()
</script>

<template>
  <Spinner :isLoading text="Cargando carrito..." />

  <div v-if="!isLoading" class="lg:px-32 px-6 lg:py-10 py-6 flex flex-col gap-8">
    <h1 class="text-4xl md:text-5xl font-bold text-sky-800">Carrito de compras</h1>

    <div
      v-if="!hasItems"
      class="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 flex flex-col gap-6 items-start"
    >
      <div class="text-2xl font-semibold text-sky-800">Tu carrito está vacío</div>
      <p class="text-slate-600 max-w-2xl">
        Aún no has agregado productos. Explora el catálogo para seleccionar equipos, micas o
        armazones.
      </p>
      <Button
        label="Ir a la tienda"
        icon="pi pi-shopping-bag"
        class="!bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800"
        @click="goToShop"
      />
    </div>

    <div v-else class="grid xl:grid-cols-[1.65fr_1fr] grid-cols-1 gap-6">
      <section class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-2xl font-semibold text-sky-800">Productos</h2>
          <span class="text-slate-600 font-medium">Total: {{ itemCount }} unidades</span>
        </div>

        <div class="flex flex-col divide-y divide-slate-200">
          <CartItemCard
            v-for="item in itemRows"
            :key="item.product_item_id"
            :item="item"
            :is-syncing="isSyncing"
            @increase="increaseQuantity"
            @decrease="decreaseQuantity"
            @remove="removeItem"
          />
        </div>
      </section>

      <aside class="flex flex-col gap-6">
        <section class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-2xl font-semibold text-sky-800">Entrega</h3>
            <Button
              label="Editar"
              icon="pi pi-pen-to-square"
              text
              class="!text-sky-800"
              @click="goToProfile"
            />
          </div>
          <div class="text-slate-600 font-semibold">{{ addressLine }}</div>
          <div class="text-slate-600 mb-4">{{ addressLocation }}</div>

          <iframe
            :src="addressMapUrl"
            title="Mapa de entrega"
            class="w-full h-[170px] rounded-xl border border-slate-200"
            loading="lazy"
            referrerpolicy="no-referrer"
          ></iframe>
        </section>

        <section class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6">
          <h3 class="text-2xl font-semibold text-sky-800 mb-4">Orden</h3>

          <div class="flex justify-between text-slate-600 py-2">
            <span>Productos</span>
            <span class="font-bold text-xl text-sky-800">${{ formatPrice(subtotal) }} MXN</span>
          </div>
          <div class="flex justify-between text-slate-600 py-2">
            <span>Envío</span>
            <span class="font-semibold">Se calcula al procesar tu pedido</span>
          </div>

          <div class="border-t border-slate-300 my-3"></div>

          <div class="flex justify-between items-center text-slate-600 py-2">
            <span class="text-2xl font-bold">TOTAL</span>
            <span class="md:text-4xl text-2xl font-bold text-sky-800"
              >${{ formatPrice(total) }} MXN</span
            >
          </div>

          <div
            v-if="stockIssues.length"
            class="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700"
          >
            <p v-for="(issue, index) in stockIssues" :key="index">{{ issue }}</p>
          </div>

          <Button
            label="Generar pedido"
            class="w-full mt-4 !bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800 !text-xl !font-semibold"
            :loading="isSubmitting"
            :disabled="!hasItems || isSyncing"
            @click="submit"
          />
        </section>
      </aside>
    </div>
  </div>

  <Toast position="bottom-right" />
</template>
