<script setup lang="ts">
import type { NavItem } from '../../composables/useNavbar'

withDefaults(
  defineProps<{
    items: NavItem[]
    isRouteActive: (routeName: string) => boolean
    variant?: 'bar' | 'row'
  }>(),
  { variant: 'bar' },
)
</script>

<template>
  <RouterLink
    v-for="item in items"
    :key="item.routeName"
    :to="{ name: item.routeName }"
    :class="[
      isRouteActive(item.routeName)
        ? 'bg-sky-900 text-white'
        : variant === 'row'
          ? 'text-slate-100 hover:bg-sky-700/70'
          : 'text-slate-200 hover:bg-sky-700/70 hover:text-white',
      variant === 'row'
        ? 'rounded-xl px-4 py-3 font-bold'
        : 'rounded-xl px-3 py-2 text-[0.98rem] font-medium transition',
    ]"
  >
    {{ item.label }}
  </RouterLink>
</template>
