<script setup lang="ts">
import Button from 'primevue/button'

import Spinner from '@/modules/core/components/Spinner.vue'
import { formatPrice } from '@/modules/core/utils/formatPrice'
import { useCartView } from '@/modules/user/composables/useCartView'
import type { CartItem } from '@/modules/user/interfaces/Cart'
import {
  getCartItemImageSrc,
  getDisplayCode,
  getLensDetails,
  getStockStatus,
  getVariationDetails,
} from '@/modules/user/utils/cart'

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

function formatLensValue(value: number): string {
  return value.toFixed(2)
}

function variationOptionKey(item: CartItem, variationOptionIndex: number): string {
  const variationOption = item.variation_options[variationOptionIndex]
  return `${item.product_item_id}-${variationOption.variation_id}-${variationOption.option_id}`
}
</script>

<template>
  <Spinner :isLoading text="Cargando carrito..." />

  <div v-if="!isLoading" class="lg:px-12 px-6 lg:py-10 py-6 flex flex-col gap-8">
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
          <article
            v-for="item in itemRows"
            :key="item.product_item_id"
            class="py-5 grid md:grid-cols-[7.5rem_1fr_auto] gap-4"
          >
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
                  :key="variationOptionKey(item, index)"
                >
                  <span class="font-semibold text-sky-800"
                    >{{ variationOption.variation_name }}:</span
                  >
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
                  :disabled="isSyncing || item.stock <= 0"
                  @click="decreaseQuantity(item)"
                />
                <span class="font-semibold text-slate-600 min-w-8 text-center">{{
                  item.quantity
                }}</span>
                <Button
                  icon="pi pi-plus"
                  text
                  rounded
                  class="!w-8 !h-8 !border !border-sky-800 !text-sky-800"
                  :disabled="isSyncing || item.stock <= item.quantity"
                  @click="increaseQuantity(item)"
                />
              </div>
            </div>

            <div class="flex flex-col items-end justify-between gap-4">
              <div class="font-bold text-3xl text-sky-800 whitespace-nowrap">
                ${{ formatPrice(item.price * item.quantity) }} MXN
              </div>
              <Button
                label="Eliminar"
                icon="pi pi-trash"
                text
                severity="danger"
                class="!text-red-600"
                :disabled="isSyncing"
                @click="removeItem(item)"
              />
            </div>
          </article>
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
            <span class="font-semibold">Gratis</span>
          </div>

          <div class="border-t border-slate-300 my-3"></div>

          <div class="flex justify-between items-center text-slate-600 py-2">
            <span class="text-2xl font-bold">TOTAL</span>
            <span class="text-4xl font-bold text-sky-800">${{ formatPrice(total) }} MXN</span>
          </div>

          <Button
            label="Pagar ahora"
            class="w-full mt-4 !bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800 !text-xl !font-semibold"
          />
        </section>
      </aside>
    </div>
  </div>

  <Toast position="bottom-right" />
</template>
