<script setup lang="ts">
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import Spinner from '@/modules/core/components/Spinner.vue'
import OrderCard from '@/modules/orders/components/OrderCard.vue'
import { useDriverOrders } from '@/modules/orders/composables/useDriverOrders'

const router = useRouter()

const { orders, pagination, isLoading, isProcessing, nextStatusLabel, setPage, advanceOrder } =
  useDriverOrders()

const first = computed(() => (pagination.value.current_page - 1) * pagination.value.per_page)

function onPageChange(event: PageState) {
  setPage(event.page + 1)
}
</script>

<template>
  <Spinner :is-loading="isLoading" text="Cargando pedidos..." />

  <div v-if="!isLoading" class="flex flex-col lg:px-32 px-6 lg:py-10 py-6 lg:gap-y-8 gap-y-6">
    <h1 v-if="orders.length > 0" class="lg:text-4xl sm:text-3xl text-3xl font-bold text-sky-800">
      Pedidos por entregar
    </h1>

    <div v-if="orders.length > 0" class="flex flex-col gap-6">
      <div class="grid gap-4">
        <OrderCard v-for="order in orders" :key="order.id" :order="order">
          <template #actions>
            <div class="flex gap-2">
              <Button
                label="Ver detalle"
                icon="pi pi-eye"
                text
                class="!text-sky-800"
                @click="router.push({ name: 'order-detail', params: { id: order.id } })"
              />
              <Button
                v-if="nextStatusLabel(order)"
                :label="nextStatusLabel(order) ?? undefined"
                icon="pi pi-truck"
                size="small"
                :loading="isProcessing(order.id)"
                class="!bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800"
                @click="advanceOrder(order)"
              />
            </div>
          </template>
        </OrderCard>
      </div>

      <Paginator
        v-if="pagination.last_page > 1"
        :rows="pagination.per_page"
        :total-records="pagination.total"
        :first="first"
        @page="onPageChange"
      />
    </div>

    <div
      v-else
      class="flex flex-col items-center gap-y-3 max-w-2xl mx-auto w-full py-24 text-center"
    >
      <div class="flex size-20 items-center justify-center rounded-full bg-sky-50 text-sky-500">
        <i class="pi pi-inbox" style="font-size: 2.5rem"></i>
      </div>
      <div class="text-2xl font-semibold text-sky-800">No hay pedidos pendientes</div>
      <div class="text-slate-500">
        Cuando haya pedidos por procesar, enviar o entregar, aparecerán aquí.
      </div>
    </div>
  </div>

  <Toast position="bottom-right" />
</template>
