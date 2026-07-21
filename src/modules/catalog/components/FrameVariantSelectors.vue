<script setup lang="ts">
import type { FrameVariantData } from '@/modules/catalog/utils/frameVariants'
import { formatPrice } from '@/modules/core/utils/formatPrice'

defineProps<{
  frameVariantData: FrameVariantData
  selectedFrameOptions: Record<string, string>
  displayPrice: number | string | null | undefined
  isFrameOptionAvailable: (variationName: string, optionValue: string) => boolean
}>()

const emit = defineEmits<{
  'select-option': [variationName: string, optionValue: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-6">
    <div
      v-for="variation in frameVariantData.variations"
      :key="variation.name"
      class="flex flex-col gap-3"
    >
      <div class="font-semibold text-sky-800">{{ variation.name }}:</div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in variation.options"
          :key="option"
          type="button"
          :disabled="!isFrameOptionAvailable(variation.name, option)"
          :class="[
            selectedFrameOptions[variation.name] === option
              ? 'border-sky-700 bg-sky-700 text-white'
              : isFrameOptionAvailable(variation.name, option)
                ? 'border-slate-300 text-slate-600 hover:border-sky-500'
                : 'cursor-not-allowed border-slate-200 text-slate-300',
            'rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition',
          ]"
          @click="emit('select-option', variation.name, option)"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <div class="font-bold text-3xl text-sky-800">${{ formatPrice(displayPrice) }} MXN</div>
  </div>
</template>
