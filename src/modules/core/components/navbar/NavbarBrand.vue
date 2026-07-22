<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
  <RouterLink :to="{ name: 'home' }" class="flex items-center gap-3">
    <div
      :class="[
        compact ? 'h-10 w-10' : 'h-12 w-12',
        'flex items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]',
      ]"
    >
      <img
        src="@/assets/images/smiley_logo.png"
        alt="Smiley Vision Logo"
        class="h-10 w-10 object-contain"
      />
    </div>
    <div class="flex flex-col leading-none text-white">
      <span :class="['font-extrabold', compact ? '' : 'text-xl']">Smiley</span>
      <span :class="['-mt-1 font-extrabold', compact ? '' : 'text-xl']">Vision</span>
    </div>
  </RouterLink>
</template>
