<script setup lang="ts">
defineProps<{
  cards: { slug: string; label: string; id: number }[]
  selected: string
}>()

defineEmits<{
  select: [slug: string]
}>()
</script>

<template>
  <div class="grid md:grid-cols-3 grid-cols-1 gap-3">
    <button
      v-for="card in cards"
      :key="card.id"
      type="button"
      @click="$emit('select', card.slug)"
      :class="[
        selected === card.slug
          ? 'border-sky-600 bg-sky-50 text-sky-800'
          : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300',
        'rounded-xl border-2 px-4 py-5 text-lg font-bold transition',
      ]"
    >
      {{ card.label }}
    </button>
  </div>
</template>
