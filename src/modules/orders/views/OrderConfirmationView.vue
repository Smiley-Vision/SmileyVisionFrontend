<script setup lang="ts">
import Button from 'primevue/button'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Spinner from '@/modules/core/components/Spinner.vue'
import OrderDetailPanel from '@/modules/orders/components/OrderDetailPanel.vue'
import { useOrderDetail } from '@/modules/orders/composables/useOrderDetail'

const route = useRoute()
const router = useRouter()
const orderId = computed(() => Number(route.params.id))

const { order, isLoading, hasError } = useOrderDetail(orderId.value)
</script>

<template>
  <Spinner :is-loading="isLoading" text="Cargando pedido..." />

  <div v-if="!isLoading" class="lg:px-32 px-6 lg:py-10 py-6 flex flex-col gap-6">
    <div
      v-if="!hasError && order"
      class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4"
    >
      <div
        class="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
      >
        <i class="pi pi-check-circle" style="font-size: 2rem"></i>
      </div>
      <div>
        <div class="text-xl font-semibold text-emerald-800">
          ¡Tu pedido fue creado correctamente!
        </div>
        <div class="text-emerald-700">
          Te notificaremos por correo sobre cualquier cambio de estado.
        </div>
      </div>
    </div>

    <div
      v-if="hasError || !order"
      class="flex flex-col items-center gap-y-3 max-w-2xl mx-auto w-full py-24 text-center"
    >
      <div class="flex size-20 items-center justify-center rounded-full bg-red-50 text-red-500">
        <i class="pi pi-exclamation-triangle" style="font-size: 2.5rem"></i>
      </div>
      <div class="text-2xl font-semibold text-sky-800">No se pudo cargar el pedido</div>
    </div>

    <div
      v-else
      class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 max-w-3xl mx-auto w-full"
    >
      <OrderDetailPanel :order="order" />
    </div>

    <div v-if="!hasError && order" class="flex justify-center gap-3">
      <Button
        label="Ver mis pedidos"
        icon="pi pi-list"
        outlined
        @click="router.push({ name: 'my-orders' })"
      />
      <Button
        label="Seguir comprando"
        icon="pi pi-shopping-bag"
        class="!bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800"
        @click="router.push({ name: 'shop' })"
      />
    </div>
  </div>
</template>
