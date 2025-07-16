<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

const isMenuOpen = ref(false)

function handleToggleMenu(state) {
  isMenuOpen.value = state
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <Navbar @toggle-menu="handleToggleMenu" />

    <!-- Content Overlay -->
    <div v-if="isMenuOpen" class="fixed inset-0 top-[7rem]
    w-full lg:bg-black/0 bg-black/30 z-40"></div>

    <!-- Main Content -->
    <div class="flex-grow relative z-10">
      <RouterView />
    </div>

    <!-- Footer -->
    <Footer></Footer>
  </div>
</template>