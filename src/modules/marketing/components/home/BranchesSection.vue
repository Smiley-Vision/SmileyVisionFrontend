<script setup lang="ts">
import BranchesMap from './BranchesMap.vue'
import SectionHeading from './SectionHeading.vue'
</script>

<template>
  <section id="branches" class="scroll-mt-32 px-6 py-16 sm:px-8 lg:px-20">
    <div class="mx-auto max-w-7xl px-0 py-0">
      <SectionHeading
        title="Sucursales"
        description="Encuéntranos en nuestras sucursales en Ciudad de México, Mérida y Campeche"
      />

      <div
        v-reveal="{ origin: 'up', distance: 42, duration: 820, delay: 120 }"
        class="mt-10 overflow-hidden rounded-[1.75rem]"
      >
        <BranchesMap />
      </div>
    </div>
  </section>
</template>
