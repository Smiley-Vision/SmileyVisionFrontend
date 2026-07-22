<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  centered: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <div
    v-reveal="{ origin: 'up', distance: 28, duration: 700 }"
    :class="centered ? 'text-center' : 'text-left'"
    class="flex flex-col gap-4"
  >
    <h2 class="text-3xl font-bold tracking-tight text-sky-800 sm:text-4xl lg:text-5xl">
      {{ title }}
    </h2>
    <p
      v-if="description"
      :class="centered ? 'mx-auto max-w-3xl' : 'max-w-2xl'"
      class="text-base font-medium leading-8 text-slate-600 sm:text-lg"
    >
      {{ description }}
    </p>
  </div>
</template>
