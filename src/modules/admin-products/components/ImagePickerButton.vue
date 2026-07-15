<script setup lang="ts">
withDefaults(
  defineProps<{
    previewUrl?: string | null
    size?: 'lg' | 'sm'
  }>(),
  {
    previewUrl: null,
    size: 'lg',
  },
)

const emit = defineEmits<{
  select: [file: File]
}>()

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]

  if (file) emit('select', file)
}
</script>

<template>
  <label
    :class="[
      size === 'lg' ? 'w-48 h-48' : 'h-24 w-full',
      'relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-sky-400 bg-slate-100 transition hover:bg-sky-50',
    ]"
  >
    <input type="file" accept="image/*" class="hidden" @change="onFileChange" />
    <img
      v-if="previewUrl"
      :src="previewUrl"
      alt="Vista previa"
      class="h-full w-full object-contain object-center bg-white"
    />
    <span v-else class="select-none text-sky-400" :class="size === 'lg' ? 'text-5xl' : 'text-2xl'"
      >+</span
    >
  </label>
</template>
