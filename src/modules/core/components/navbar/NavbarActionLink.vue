<script setup lang="ts">
import { computed } from 'vue'

import type { NavItem } from '../../composables/useNavbar'

const props = withDefaults(
  defineProps<{
    item: NavItem
    active: boolean
    variant?: 'pill' | 'row'
  }>(),
  { variant: 'pill' },
)

const badgeLabel = computed(() => {
  const badge = props.item.badge ?? 0
  return badge > 99 ? '99+' : String(badge)
})
</script>

<template>
  <RouterLink
    :to="{ name: item.routeName, params: item.params }"
    :class="[
      active ? 'bg-sky-900 text-white' : 'text-slate-100 hover:bg-sky-700/70',
      variant === 'row'
        ? 'flex items-center justify-between rounded-xl px-4 py-3 font-bold'
        : 'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition',
    ]"
  >
    <span :class="variant === 'row' ? 'flex items-center gap-3' : 'contents'">
      <i :class="item.icon"></i>
      <span>{{ item.label }}</span>
    </span>
    <span
      v-if="(item.badge ?? 0) > 0"
      class="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.72rem] font-bold text-white"
    >
      {{ badgeLabel }}
    </span>
  </RouterLink>
</template>
