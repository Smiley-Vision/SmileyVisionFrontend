<script setup>
import { RouterView } from 'vue-router'

import Footer from './modules/core/components/Footer.vue'
import Navbar from './modules/core/components/Navbar.vue'
</script>

<template>
  <div class="grid min-h-screen grid-rows-[auto_1fr_auto]">
    <Navbar />

    <main class="flex flex-col">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>
