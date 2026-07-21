<script setup lang="ts">
import Card from 'primevue/card'

import { formatDate } from '@/modules/core/utils/formatDate'
import { formatPrice } from '@/modules/core/utils/formatPrice'
import OrderStatusBadge from '@/modules/orders/components/OrderStatusBadge.vue'
import type { Order } from '@/modules/orders/interfaces/Order'

defineProps<{
  order: Order
}>()
</script>

<template>
  <Card
    class="overflow-hidden rounded-[14px] border border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
    :pt="{ body: { class: '!p-0' }, content: { class: '!p-0' } }"
  >
    <template #content>
      <div class="flex flex-col gap-3 p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-semibold text-sky-900">Pedido #{{ order.id }}</div>
            <div class="text-xs text-slate-400">{{ formatDate(order.created_at) }}</div>
          </div>
          <OrderStatusBadge :status="order.current_status" />
        </div>

        <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
          <span v-if="order.optician_name"
            ><i class="pi pi-user mr-1"></i>{{ order.optician_name }}</span
          >
          <span v-if="order.branch_office_name"
            ><i class="pi pi-building mr-1"></i>{{ order.branch_office_name }}</span
          >
          <span v-if="order.total !== undefined" class="font-semibold text-sky-800">
            ${{ formatPrice(order.total) }} MXN
          </span>
        </div>

        <div class="flex justify-end pt-1">
          <slot name="actions" />
        </div>
      </div>
    </template>
  </Card>
</template>
