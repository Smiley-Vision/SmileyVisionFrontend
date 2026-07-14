<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    routeName: string
    icon: string
    badge?: number
    compact?: boolean
    ariaLabel?: string
  }>(),
  { badge: 0, compact: false, ariaLabel: undefined },
)

const badgeLabel = computed(() => (props.badge > 99 ? '99+' : String(props.badge)))
</script>

<template>
  <RouterLink
    :to="{ name: routeName }"
    :aria-label="ariaLabel"
    :class="[
      compact ? 'h-10 w-10' : 'h-11 w-11',
      'relative flex items-center justify-center rounded-full bg-white text-sky-800 shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition',
      compact ? '' : 'hover:scale-[1.03]',
    ]"
  >
    <i :class="[icon, compact ? '' : 'text-base']"></i>
    <span
      v-if="badge > 0"
      class="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.65rem] font-bold text-white"
    >
      {{ badgeLabel }}
    </span>
  </RouterLink>
</template>
