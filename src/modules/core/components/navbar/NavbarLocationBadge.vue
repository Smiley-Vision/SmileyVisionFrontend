<script setup lang="ts">
withDefaults(defineProps<{ label: string; compact?: boolean }>(), { compact: false })
</script>

<template>
  <div :class="['flex items-center text-slate-100', compact ? 'gap-3' : '']">
    <span
      :class="[
        compact ? 'h-9 w-9' : 'h-10 w-10',
        'flex items-center justify-center text-white',
      ]"
    >
      <i :class="[compact ? 'text-[1.2rem]' : 'text-[1.35rem]', 'pi pi-map-marker']"></i>
    </span>
    <div class="leading-tight">
      <p class="text-sm font-bold text-white">{{ label }}</p>
    </div>
  </div>
</template>
