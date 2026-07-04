<script setup>
import Footer from '@/modules/shared/ui/layout/Footer.vue'
import Navbar from '@/modules/shared/ui/layout/Navbar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <Navbar />
  <RouterView />
  <Footer />
</template>
