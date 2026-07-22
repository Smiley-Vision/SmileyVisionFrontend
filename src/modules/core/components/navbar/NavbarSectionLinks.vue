<script setup lang="ts">
import type { NavItem } from '../../composables/useNavbar'

withDefaults(
  defineProps<{
    items: NavItem[]
    isRouteActive: (item: NavItem) => boolean
    variant?: 'bar' | 'row'
  }>(),
  { variant: 'bar' },
)
</script>

<template>
  <RouterLink
    v-for="item in items"
    :key="item.label"
    :to="{ name: item.routeName, params: item.params }"
    :class="[
      isRouteActive(item)
        ? 'text-white'
        : variant === 'row'
          ? 'text-slate-100'
          : 'text-slate-200 hover:text-white',
      variant === 'row'
        ? 'rounded-xl pr-5 py-3 font-bold'
        : 'rounded-xl pr-5 py-2 text-[0.98rem] font-medium transition',
    ]"
  >
    {{ item.label }}
  </RouterLink>
</template>
