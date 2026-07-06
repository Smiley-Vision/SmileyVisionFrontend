<script setup>
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { ref } from 'vue'

import ProfileAddressCard from '@/modules/user/components/ProfileAddressCard.vue'

defineProps({
  addresses: {
    type: Array,
    required: true,
  },
  hasAddresses: {
    type: Boolean,
    required: true,
  },
  menuItems: {
    type: Array,
    required: true,
  },
  getMapThumbnail: {
    type: Function,
    required: true,
  },
  formatMainLine: {
    type: Function,
    required: true,
  },
  formatSecondaryLine: {
    type: Function,
    required: true,
  },
})

defineEmits(['open-actions', 'add-address'])

const menuRef = ref(null)

function toggle(event) {
  menuRef.value?.toggle(event)
}

defineExpose({ toggle })
</script>

<template>
  <div class="pt-8">
    <div class="text-sky-800 text-4xl font-bold mb-5">Direcciones</div>

    <div
      v-if="!hasAddresses"
      class="border border-dashed border-slate-400 rounded-xl p-4 text-slate-600 font-medium"
    >
      No tienes direcciones registradas. Agrega la primera dirección para comenzar.
    </div>

    <div v-else class="grid lg:grid-cols-2 grid-cols-1 gap-6">
      <ProfileAddressCard
        v-for="address in addresses"
        :key="address.id"
        :address="address"
        :map-src="getMapThumbnail(address)"
        :main-line="formatMainLine(address)"
        :secondary-line="formatSecondaryLine(address)"
        @open-actions="$emit('open-actions', $event)"
      />
    </div>

    <Menu ref="menuRef" :model="menuItems" popup />

    <Button
      label="Agregar otra dirección"
      icon="pi pi-plus"
      class="mt-6 !text-[#075985] hover:!text-[#0c4a6e] font-bold text-xl"
      text
      @click="$emit('add-address')"
    />
  </div>
</template>
