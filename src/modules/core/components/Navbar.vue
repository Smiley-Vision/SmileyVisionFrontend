<script setup lang="ts">
import { useNavbar } from '../composables/useNavbar'
import NavbarActionLink from './navbar/NavbarActionLink.vue'
import NavbarBrand from './navbar/NavbarBrand.vue'
import NavbarIconButtonLink from './navbar/NavbarIconButtonLink.vue'
import NavbarLocationBadge from './navbar/NavbarLocationBadge.vue'
import NavbarMobileMenu from './navbar/NavbarMobileMenu.vue'
import NavbarSectionLinks from './navbar/NavbarSectionLinks.vue'
import NavbarSearchForm from './navbar/NavbarSearchForm.vue'

const {
  isMenuOpen,
  dropDownMenu,
  searchQuery,
  isAuthenticated,
  isBuyer,
  cartCount,
  userDisplayName,
  roleLabel,
  profileIcon,
  locationLabel,
  leftNavItems,
  rightNavItems,
  isRouteActive,
  toggleMenu,
  submitSearch,
} = useNavbar()
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-sky-900/10 bg-sky-800 text-white shadow-[0_10px_24px_rgba(7,89,133,0.18)]"
  >
    <div class="mx-auto max-w-[1600px] lg:px-12 px-6 py-2.5">
      <div
        class="hidden items-center gap-5 lg:grid lg:grid-cols-[220px_minmax(320px,1fr)_260px_220px]"
      >
        <NavbarBrand />

        <NavbarSearchForm
          v-model="searchQuery"
          placeholder="Buscar productos, marcas y más..."
          @submit="submitSearch"
        />

        <NavbarLocationBadge :label="locationLabel" />

        <div class="flex items-center justify-end gap-2">
          <NavbarActionLink
            v-for="item in rightNavItems"
            :key="item.routeName"
            :item="item"
            :active="isRouteActive(item.routeName)"
          />

          <NavbarIconButtonLink
            v-if="isAuthenticated"
            route-name="profile"
            :icon="profileIcon"
            aria-label="Ir al perfil"
          />
        </div>
      </div>

      <div class="hidden items-center justify-between gap-6 pt-2 lg:flex">
        <div class="flex flex-wrap items-center gap-1">
          <NavbarSectionLinks :items="leftNavItems" :is-route-active="isRouteActive" />
        </div>

        <div
          v-if="isAuthenticated"
          class="flex items-center gap-2 text-sm font-medium text-slate-300"
        >
          <span>{{ userDisplayName }}</span>
          <span class="text-slate-400">|</span>
          <span>{{ roleLabel }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-3 lg:hidden">
        <div class="flex items-center justify-between gap-4">
          <NavbarBrand compact />

          <div class="flex items-center gap-2">
            <NavbarIconButtonLink
              v-if="isBuyer"
              route-name="cart"
              icon="pi pi-shopping-cart"
              :badge="cartCount"
              compact
            />
            <NavbarIconButtonLink
              v-if="isAuthenticated"
              route-name="profile"
              :icon="profileIcon"
              compact
            />
            <button
              id="menu-button"
              :class="`pi ${isMenuOpen ? 'pi-times' : 'pi-bars'}`"
              class="rounded-xl p-2 text-white"
              style="font-size: 1.6rem"
              @click="toggleMenu"
            ></button>
          </div>
        </div>

        <NavbarSearchForm
          v-model="searchQuery"
          placeholder="Buscar productos..."
          compact
          @submit="submitSearch"
        />

        <NavbarLocationBadge :label="locationLabel" compact />
      </div>
    </div>
  </header>

  <div v-if="isMenuOpen" class="fixed inset-0 top-[7rem] z-40 w-full bg-black/30 lg:hidden"></div>

  <div ref="dropDownMenu" class="sticky top-[76px] z-50 flex justify-end lg:hidden">
    <NavbarMobileMenu
      :is-open="isMenuOpen"
      :left-nav-items="leftNavItems"
      :right-nav-items="rightNavItems"
      :is-authenticated="isAuthenticated"
      :user-display-name="userDisplayName"
      :role-label="roleLabel"
      :profile-icon="profileIcon"
      :is-route-active="isRouteActive"
    />
  </div>
</template>
