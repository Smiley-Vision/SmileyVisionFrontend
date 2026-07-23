<script setup lang="ts">
import { computed } from 'vue'

import type { OrderStatusName } from '@/modules/orders/interfaces/Order'

const props = defineProps<{
  status: OrderStatusName | string
}>()

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  procesando: 'Procesando',
  enviado: 'Enviado',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

const STATUS_CLASSES: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  procesando: 'bg-sky-100 text-sky-700',
  enviado: 'bg-indigo-100 text-indigo-700',
  completado: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-red-100 text-red-700',
}

const label = computed(() => STATUS_LABELS[props.status] ?? props.status)
const classes = computed(() => STATUS_CLASSES[props.status] ?? 'bg-slate-100 text-slate-700')
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
    :class="classes"
  >
    {{ label }}
  </span>
</template>
