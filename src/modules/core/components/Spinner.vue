<script setup lang="ts">
interface Props {
  isLoading: boolean
  text?: string
}

const { text = 'Cargando...' } = defineProps<Props>()
</script>

<template>
  <div v-if="isLoading" class="flex flex-col items-center py-48 gap-y-6">
    <ProgressSpinner style="width: 5rem; height: 5rem" stroke-width="3" />
    <span class="text-xl font-semibold text-sky-800">{{ text }}</span>
  </div>
</template>
