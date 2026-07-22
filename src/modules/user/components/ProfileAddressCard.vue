<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'

import type { Address } from '@/modules/user/interfaces/Address'

const props = defineProps<{
  address: Address
  mapSrc: string
  mainLine: string
  secondaryLine: string
}>()

const emit = defineEmits<{
  'open-actions': [payload: { event: Event; address: Address }]
}>()

function handleOpenActions(event: Event) {
  emit('open-actions', {
    event,
    address: props.address,
  })
}
</script>

<template>
  <Card
    class="overflow-hidden rounded-[14px] border border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
    :pt="{
      body: { class: '!p-0' },
      content: { class: '!p-0' },
    }"
  >
    <template #content>
      <div
        class="h-[200px] min-h-[200px] relative overflow-hidden rounded-t-[12px] border-b border-slate-300"
      >
        <iframe
          :src="mapSrc"
          :title="`Mapa de ${mainLine}`"
          class="w-full h-full border-0 block"
          loading="lazy"
          referrerpolicy="no-referrer"
        ></iframe>

        <span
          v-if="address.is_default"
          class="absolute top-[0.6rem] left-[0.6rem] bg-[#075985] border border-[#075985] text-white rounded-lg px-3 py-1 text-sm font-bold leading-none"
        >
          PRINCIPAL
        </span>

        <Button
          icon="pi pi-ellipsis-h"
          size="small"
          rounded
          aria-label="Opciones de dirección"
          class="!absolute !top-[0.6rem] !right-[0.6rem] !w-9 !h-9 !bg-[#075985] !border-[#075985] !text-white hover:!bg-[#0c4a6e] hover:!border-[#0c4a6e]"
          @click="handleOpenActions"
        />
      </div>

      <div :class="address.is_default ? 'p-4 bg-[#075985]' : 'p-4 bg-white'">
        <div
          :class="
            address.is_default
              ? 'flex items-center gap-[0.45rem] font-bold text-[1.05rem] text-white'
              : 'flex items-center gap-[0.45rem] font-bold text-[1.05rem] text-[#075985]'
          "
        >
          <i class="pi pi-map-marker"></i>
          <span>{{ mainLine }}</span>
        </div>
        <div
          :class="
            address.is_default
              ? 'mt-[0.4rem] font-medium text-sky-100'
              : 'mt-[0.4rem] font-medium text-slate-600'
          "
        >
          {{ secondaryLine }}
        </div>
      </div>
    </template>
  </Card>
</template>
