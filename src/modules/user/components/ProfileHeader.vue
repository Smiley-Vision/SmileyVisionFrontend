<script setup lang="ts">
import Button from 'primevue/button'
import Tag from 'primevue/tag'

withDefaults(
  defineProps<{
    fullName: string
    roleLabel: string
    isLoggingOut?: boolean
  }>(),
  {
    isLoggingOut: false,
  },
)

defineEmits<{
  'edit-profile': []
  logout: []
}>()
</script>

<template>
  <div
    class="flex md:flex-row flex-col md:items-center items-start justify-between md:gap-6 gap-4 pb-6"
  >
    <div class="flex md:flex-row flex-col md:items-center items-start gap-5">
      <div class="w-[124px] h-[124px] rounded-full flex items-center justify-center bg-[#d0dbe5]">
        <i class="pi pi-user text-slate-500" style="scale: 3"></i>
      </div>
      <div>
        <div class="text-sky-800 md:text-5xl text-3xl font-bold leading-tight">
          {{ fullName }}
        </div>
        <Tag :value="roleLabel" severity="secondary" class="mt-3" />
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-3">
      <Button
        label="Editar información"
        icon="pi pi-pen-to-square"
        class="!bg-[#075985] !border-[#075985] hover:!bg-[#1373aa] hover:!border-[#1373aa]"
        @click="$emit('edit-profile')"
      />
      <Button
        label="Cerrar sesión"
        icon="pi pi-sign-out"
        severity="danger"
        :loading="isLoggingOut"
        @click="$emit('logout')"
      />
    </div>
  </div>
</template>
