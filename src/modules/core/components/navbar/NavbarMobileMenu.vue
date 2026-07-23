<script setup lang="ts">
import type { NavItem } from '../../composables/useNavbar'
import NavbarActionLink from './NavbarActionLink.vue'
import NavbarProfileSummary from './NavbarProfileSummary.vue'
import NavbarSectionLinks from './NavbarSectionLinks.vue'

defineProps<{
  isOpen: boolean
  leftNavItems: NavItem[]
  rightNavItems: NavItem[]
  isAuthenticated: boolean
  userDisplayName: string
  roleLabel: string
  profileIcon: string
  isRouteActive: (item: NavItem) => boolean
}>()
</script>

<template>
  <div
    :class="[
      isOpen
        ? 'translate-y-0 opacity-100 pointer-events-auto'
        : 'pointer-events-none -translate-y-2 opacity-0',
      'absolute right-4 w-[min(22rem,calc(100vw-2rem))] rounded-[1.2rem] border border-sky-700/30 bg-sky-800 px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition duration-200',
    ]"
  >
    <div class="flex flex-col gap-2">
      <NavbarSectionLinks :items="leftNavItems" :is-route-active="isRouteActive" variant="row" />

      <NavbarProfileSummary
        v-if="isAuthenticated"
        :icon="profileIcon"
        :display-name="userDisplayName"
        :role-label="roleLabel"
      />

      <NavbarActionLink
        v-for="item in rightNavItems"
        :key="item.label"
        :item="item"
        :active="isRouteActive(item)"
        variant="row"
      />
    </div>
  </div>
</template>
