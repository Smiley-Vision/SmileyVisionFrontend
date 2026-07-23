<script setup lang="ts">
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import Select from 'primevue/select'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import Spinner from '@/modules/core/components/Spinner.vue'
import OrderCard from '@/modules/orders/components/OrderCard.vue'
import { useAdminOrders } from '@/modules/orders/composables/useAdminOrders'
import { useOrderReports } from '@/modules/orders/composables/useOrderReports'

const router = useRouter()

const {
  orders,
  pagination,
  isLoading,
  statusFilter,
  monthFilter,
  yearFilter,
  setPage,
  applyFilters,
} = useAdminOrders()

const { isDownloading, downloadMonthly, downloadWeekly } = useOrderReports()

const STATUS_OPTIONS = [
  { label: 'Todos los estados', value: null },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Procesando', value: 'procesando' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'Completado', value: 'completado' },
  { label: 'Cancelado', value: 'cancelado' },
]

const now = new Date()
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  label: new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(new Date(2000, index, 1)),
  value: index + 1,
}))
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, index) => now.getFullYear() - index)

monthFilter.value = now.getMonth() + 1
yearFilter.value = now.getFullYear()

const first = computed(() => (pagination.value.current_page - 1) * pagination.value.per_page)

function onPageChange(event: PageState) {
  setPage(event.page + 1)
}

function downloadMonthlyReport() {
  if (!monthFilter.value || !yearFilter.value) return
  void downloadMonthly(monthFilter.value, yearFilter.value)
}

function downloadThisWeekReport() {
  const today = new Date()
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)
  void downloadWeekly(toIsoDate(monday), toIsoDate(sunday))
}
</script>

<template>
  <Spinner :is-loading="isLoading" text="Cargando pedidos..." />

  <div v-if="!isLoading" class="flex flex-col lg:px-32 px-6 lg:py-10 py-6 lg:gap-y-8 gap-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h1 class="lg:text-4xl sm:text-3xl text-3xl font-bold text-sky-800">Pedidos</h1>

      <div class="flex gap-2">
        <Button
          label="Reporte del mes"
          icon="pi pi-file-pdf"
          outlined
          :loading="isDownloading"
          @click="downloadMonthlyReport"
        />
        <Button
          label="Reporte de esta semana"
          icon="pi pi-file-pdf"
          outlined
          :loading="isDownloading"
          @click="downloadThisWeekReport"
        />
      </div>
    </div>

    <div class="flex flex-wrap gap-4 items-end bg-white border border-slate-200 rounded-xl p-4">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-500">Estado</label>
        <Select
          v-model="statusFilter"
          :options="STATUS_OPTIONS"
          option-label="label"
          option-value="value"
          class="w-48"
          @update:model-value="applyFilters"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-500">Mes</label>
        <Select
          v-model="monthFilter"
          :options="MONTH_OPTIONS"
          option-label="label"
          option-value="value"
          class="w-40"
          @update:model-value="applyFilters"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-500">Año</label>
        <Select
          v-model="yearFilter"
          :options="YEAR_OPTIONS"
          class="w-28"
          @update:model-value="applyFilters"
        />
      </div>
    </div>

    <div v-if="orders.length > 0" class="flex flex-col gap-6">
      <div class="grid gap-4">
        <OrderCard v-for="order in orders" :key="order.id" :order="order">
          <template #actions>
            <Button
              label="Ver detalle"
              icon="pi pi-eye"
              text
              class="!text-sky-800"
              @click="router.push({ name: 'admin-orders-detail', params: { id: order.id } })"
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
      <div class="text-2xl font-semibold text-sky-800">No hay pedidos con estos filtros</div>
    </div>
  </div>
</template>
