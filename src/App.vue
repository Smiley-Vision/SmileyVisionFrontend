<script setup>
import { RouterView } from 'vue-router'

import Footer from './modules/core/components/Footer.vue'
import Navbar from './modules/core/components/Navbar.vue'
</script>

<template>
  <Navbar />
  <RouterView />
  <Footer />
</template>
