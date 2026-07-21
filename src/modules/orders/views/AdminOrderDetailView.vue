<script setup lang="ts">
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import Spinner from '@/modules/core/components/Spinner.vue'
import OrderDetailPanel from '@/modules/orders/components/OrderDetailPanel.vue'
import { useOrderDetail } from '@/modules/orders/composables/useOrderDetail'
import { useOrderStatusTransition } from '@/modules/orders/composables/useOrderStatusTransition'
import type { OrderStatusName } from '@/modules/orders/interfaces/Order'

const NEXT_STATUSES: Record<OrderStatusName, { label: string; value: string }[]> = {
  pendiente: [
    { label: 'Procesando', value: 'procesando' },
    { label: 'Cancelado', value: 'cancelado' },
  ],
  procesando: [
    { label: 'Enviado', value: 'enviado' },
    { label: 'Cancelado', value: 'cancelado' },
  ],
  enviado: [{ label: 'Completado', value: 'completado' }],
  completado: [],
  cancelado: [],
}

const route = useRoute()
const orderId = computed(() => Number(route.params.id))

const { order, isLoading, hasError, reload } = useOrderDetail(orderId.value)
const { isSubmitting, transition } = useOrderStatusTransition()

const selectedStatus = ref<string | null>(null)
const shippingCost = ref<number | null>(null)
const deliveryDeadline = ref<string>('')
const note = ref<string>('')

const nextStatusOptions = computed(() =>
  order.value ? NEXT_STATUSES[order.value.current_status] : [],
)

watch(order, () => {
  selectedStatus.value = null
  shippingCost.value = null
  deliveryDeadline.value = ''
  note.value = ''
})

async function submit() {
  if (!selectedStatus.value) return

  const updated = await transition(orderId.value, {
    status: selectedStatus.value,
    shipping_cost: shippingCost.value ?? undefined,
    delivery_deadline: deliveryDeadline.value || undefined,
    note: note.value || undefined,
  })

  if (updated) {
    await reload()
  }
}
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

    <div v-else class="grid lg:grid-cols-[1.4fr_1fr] gap-6 max-w-5xl mx-auto w-full">
      <section class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6">
        <OrderDetailPanel :order="order" />
      </section>

      <section
        class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 h-fit flex flex-col gap-4"
      >
        <h3 class="text-xl font-semibold text-sky-800">Cambiar estado</h3>

        <div v-if="nextStatusOptions.length === 0" class="text-slate-500 text-sm">
          Este pedido ya se encuentra en un estado final.
        </div>

        <template v-else>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Nuevo estado</label>
            <Select
              v-model="selectedStatus"
              :options="nextStatusOptions"
              option-label="label"
              option-value="value"
              placeholder="Selecciona un estado"
              fluid
            />
          </div>

          <div v-if="selectedStatus === 'procesando'" class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Costo de envío (obligatorio)</label>
            <InputNumber
              v-model="shippingCost"
              mode="currency"
              currency="MXN"
              locale="es-MX"
              fluid
            />
          </div>

          <div v-if="selectedStatus === 'procesando'" class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Fecha límite de entrega</label>
            <input
              type="date"
              v-model="deliveryDeadline"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Nota (opcional)</label>
            <Textarea v-model="note" rows="2" fluid />
          </div>

          <Button
            label="Actualizar estado"
            class="!bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800"
            :loading="isSubmitting"
            :disabled="
              !selectedStatus || (selectedStatus === 'procesando' && shippingCost === null)
            "
            @click="submit"
          />
        </template>
      </section>
    </div>
  </div>
</template>
