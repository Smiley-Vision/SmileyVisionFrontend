<script setup lang="ts">
import { computed } from 'vue'

const modelValue = defineModel<string>({ required: true })

withDefaults(defineProps<{ compact?: boolean; placeholder?: string }>(), {
  compact: false,
  placeholder: 'Buscar productos, marcas y más...',
})

const emit = defineEmits<{ submit: [] }>()

const canSubmit = computed(() => modelValue.value.trim().length > 0)
</script>

<template>
  <form
    class="flex items-center overflow-hidden rounded-[0.55rem] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
    @submit.prevent="emit('submit')"
  >
    <input
      v-model="modelValue"
      type="search"
      :placeholder="placeholder"
      :class="[
        compact ? 'h-10 px-4 text-sm' : 'h-11 px-5 text-base',
        'w-full border-0 font-medium text-slate-700 outline-none placeholder:text-slate-400',
      ]"
    />
    <button
      type="submit"
      :disabled="!canSubmit"
      :class="[
        compact ? 'h-10 w-12' : 'h-11 w-14',
        'flex items-center justify-center border-l border-slate-200 text-slate-500 transition enabled:hover:bg-slate-50 enabled:hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50',
      ]"
    >
      <i class="pi pi-search text-lg"></i>
    </button>
  </form>
</template>
