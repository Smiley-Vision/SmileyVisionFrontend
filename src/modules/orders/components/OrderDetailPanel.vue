<script setup lang="ts">
import { computed } from 'vue'

import { formatDateTime } from '@/modules/core/utils/formatDate'
import { formatPrice } from '@/modules/core/utils/formatPrice'
import OrderStatusBadge from '@/modules/orders/components/OrderStatusBadge.vue'
import type { Order } from '@/modules/orders/interfaces/Order'

const props = defineProps<{
  order: Order
}>()

const itemsTotal = computed(() =>
  (props.order.items ?? []).reduce((acc, item) => acc + Number(item.unit_price) * item.quantity, 0),
)

const shippingCost = computed(() => Number(props.order.shipping_cost ?? 0))
const grandTotal = computed(() => itemsTotal.value + shippingCost.value)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-sky-900">Pedido #{{ order.id }}</h2>
        <div class="text-sm text-slate-500">{{ formatDateTime(order.created_at) }}</div>
      </div>
      <OrderStatusBadge :status="order.current_status" />
    </div>

    <div class="grid sm:grid-cols-2 gap-4 text-sm">
      <div v-if="order.optician_name" class="rounded-lg bg-slate-50 p-3">
        <div class="text-slate-400">Cliente</div>
        <div class="font-medium text-slate-700">{{ order.optician_name }}</div>
      </div>
      <div v-if="order.branch_office_name" class="rounded-lg bg-slate-50 p-3">
        <div class="text-slate-400">Sucursal que surte</div>
        <div class="font-medium text-slate-700">{{ order.branch_office_name }}</div>
      </div>
      <div v-if="order.delivery_deadline" class="rounded-lg bg-slate-50 p-3">
        <div class="text-slate-400">Fecha límite de entrega</div>
        <div class="font-medium text-slate-700">{{ formatDateTime(order.delivery_deadline) }}</div>
      </div>
      <div v-if="order.delivery_address" class="rounded-lg bg-slate-50 p-3">
        <div class="text-slate-400">Dirección de entrega</div>
        <div class="font-medium text-slate-700">
          Calle {{ order.delivery_address.street }} #{{ order.delivery_address.external_number }},
          {{ order.delivery_address.district }}
        </div>
      </div>
    </div>

    <div>
      <h3 class="text-lg font-semibold text-sky-800 mb-2">Artículos</h3>
      <div class="flex flex-col divide-y divide-slate-200 rounded-lg border border-slate-200">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="flex items-center justify-between gap-3 p-3 text-sm"
        >
          <div>
            <div class="font-medium text-slate-700">{{ item.product_name }}</div>
            <div class="text-xs text-slate-400">
              SKU {{ item.SKU }} · {{ item.quantity }} unidades
            </div>
          </div>
          <div class="font-semibold text-sky-800">${{ formatPrice(item.unit_price) }} MXN</div>
        </div>
      </div>
    </div>

    <div class="rounded-lg bg-slate-50 p-4 flex flex-col gap-1 text-sm ml-auto w-full sm:w-72">
      <div class="flex justify-between text-slate-600">
        <span>Productos</span>
        <span>${{ formatPrice(itemsTotal) }} MXN</span>
      </div>
      <div class="flex justify-between text-slate-600">
        <span>Envío</span>
        <span>{{
          order.shipping_cost !== null ? `$${formatPrice(shippingCost)} MXN` : 'Por definir'
        }}</span>
      </div>
      <div class="flex justify-between font-bold text-sky-900 border-t border-slate-300 mt-1 pt-1">
        <span>Total</span>
        <span>${{ formatPrice(grandTotal) }} MXN</span>
      </div>
    </div>

    <div v-if="order.status_history?.length">
      <h3 class="text-lg font-semibold text-sky-800 mb-2">Historial</h3>
      <div class="flex flex-col gap-2">
        <div
          v-for="entry in order.status_history"
          :key="entry.id"
          class="flex items-center justify-between text-sm rounded-lg bg-slate-50 p-3"
        >
          <div class="flex items-center gap-2">
            <OrderStatusBadge :status="entry.status" />
            <span v-if="entry.note" class="text-slate-500">{{ entry.note }}</span>
          </div>
          <span class="text-xs text-slate-400">{{ formatDateTime(entry.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
