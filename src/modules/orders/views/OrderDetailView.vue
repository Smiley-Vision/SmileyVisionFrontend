<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import Spinner from '@/modules/core/components/Spinner.vue'
import OrderDetailPanel from '@/modules/orders/components/OrderDetailPanel.vue'
import { useOrderDetail } from '@/modules/orders/composables/useOrderDetail'

const route = useRoute()
const orderId = computed(() => Number(route.params.id))

const { order, isLoading, hasError } = useOrderDetail(orderId.value)
</script>

<template>
  <Spinner :is-loading="isLoading" text="Cargando pedido..." />

  <div v-if="!isLoading" class="lg:px-32 px-6 lg:py-10 py-6">
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
  </div>
</template>
