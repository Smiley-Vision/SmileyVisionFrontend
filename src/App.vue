<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'

const isMenuOpen = ref(false)

function handleToggleMenu(state) {
  isMenuOpen.value = state
}
</script>

<template>
  <div class="relative">
    <!-- Navbar -->
    <Navbar @toggle-menu="handleToggleMenu" />

    <!-- Content Overlay -->
    <div v-if="isMenuOpen" class="absolute top-[7rem] left-0
    w-full h-[calc(100vh-7rem)] bg-black/30 z-40"></div>

    <!-- Main Content -->
    <div class="relative z-10">
      <RouterView />
    </div>
  </div>
</template>