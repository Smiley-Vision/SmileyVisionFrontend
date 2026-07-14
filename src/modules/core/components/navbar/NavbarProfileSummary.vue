<script setup lang="ts">
defineProps<{ icon: string; displayName: string; roleLabel: string }>()
</script>

<template>
  <RouterLink :to="{ name: 'profile' }" class="mt-2 rounded-xl bg-sky-900/80 px-4 py-3">
    <div class="flex items-center gap-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-800">
        <i :class="icon"></i>
      </span>
      <span class="flex flex-col leading-tight">
        <span class="max-w-[180px] truncate font-bold text-white">{{ displayName }}</span>
        <span class="text-xs text-slate-300">{{ roleLabel }}</span>
      </span>
    </div>
  </RouterLink>
</template>
