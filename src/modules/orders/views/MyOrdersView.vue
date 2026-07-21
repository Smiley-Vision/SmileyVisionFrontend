<script setup lang="ts">
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import Spinner from '@/modules/core/components/Spinner.vue'
import OrderCard from '@/modules/orders/components/OrderCard.vue'
import { useMyOrders } from '@/modules/orders/composables/useMyOrders'

const router = useRouter()
const { orders, pagination, isLoading, setPage } = useMyOrders()

const first = computed(() => (pagination.value.current_page - 1) * pagination.value.per_page)

function onPageChange(event: PageState) {
  setPage(event.page + 1)
}
</script>

<template>
  <Spinner :is-loading="isLoading" text="Cargando pedidos..." />

  <div v-if="!isLoading" class="flex flex-col lg:px-32 px-6 lg:py-10 py-6 lg:gap-y-10 gap-y-6">
    <h1 v-if="orders.length > 0" class="lg:text-4xl sm:text-3xl text-3xl font-bold text-sky-800">
      Mis pedidos
    </h1>

    <div v-if="orders.length > 0" class="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <div class="grid gap-4">
        <OrderCard v-for="order in orders" :key="order.id" :order="order">
          <template #actions>
            <Button
              label="Ver detalle"
              icon="pi pi-eye"
              text
              class="!text-sky-800"
              @click="router.push({ name: 'order-detail', params: { id: order.id } })"
            />
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
      <div class="text-2xl font-semibold text-sky-800">Aún no tienes pedidos</div>
      <div class="text-slate-500">
        Cuando realices una compra, tus pedidos aparecerán aquí para que puedas dar seguimiento a su
        estado.
      </div>
      <Button
        label="Ir a la tienda"
        icon="pi pi-shopping-bag"
        class="!bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800"
        @click="router.push({ name: 'shop' })"
      />
    </div>
  </div>
</template>
