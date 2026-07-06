<script setup>
import { RouterView } from 'vue-router'

import Footer from './modules/core/components/Footer.vue'
import Navbar from './modules/core/components/Navbar.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <Navbar />

    <!-- Content -->
    <main class="flex flex-1 flex-col min-h-screen">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>
