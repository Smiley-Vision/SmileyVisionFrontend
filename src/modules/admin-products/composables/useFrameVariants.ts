import { computed, reactive, watch } from 'vue'
import type { Ref } from 'vue'

import type { Variation, VariationOption } from '@/modules/admin-products/interfaces/Variation'
import { frameVariantRowSchema } from '@/modules/admin-products/schemas/frameVariantRowSchema'

export interface FrameVariantCombination {
  index: number
  colorOption: VariationOption
  materialOption: VariationOption
  sku: string
}

export interface FrameVariantRowState {
  price: number
  image: File | null
  previewUrl: string | null
}

function buildFrameSku(prefix: string, index: number): string {
  return `${prefix.trim().toUpperCase()}-${index + 1}`
}

export function useFrameVariants(
  frameVariations: Ref<Variation[]>,
  colorOptionIds: Ref<number[]>,
  materialOptionIds: Ref<number[]>,
  skuPrefix: Ref<string>,
) {
  const colorOptions = computed(
    () =>
      frameVariations.value.find((variation) => variation.name === 'Color')?.variation_options ??
      [],
  )
  const materialOptions = computed(
    () =>
      frameVariations.value.find((variation) => variation.name === 'Material')
        ?.variation_options ?? [],
  )

  const rows = reactive<Record<number, FrameVariantRowState>>({})

  const combinations = computed<FrameVariantCombination[]>(() => {
    const selectedColors = colorOptions.value.filter((option) =>
      colorOptionIds.value.includes(option.id),
    )
    const selectedMaterials = materialOptions.value.filter((option) =>
      materialOptionIds.value.includes(option.id),
    )

    const result: FrameVariantCombination[] = []
    let index = 0

    for (const colorOption of selectedColors) {
      for (const materialOption of selectedMaterials) {
        result.push({
          index,
          colorOption,
          materialOption,
          sku: buildFrameSku(skuPrefix.value, index),
        })
        index += 1
      }
    }

    return result
  })

  function revokeRowPreview(row?: FrameVariantRowState) {
    if (row?.previewUrl) URL.revokeObjectURL(row.previewUrl)
  }

  watch(
    combinations,
    (newCombinations) => {
      const validIndexes = new Set(newCombinations.map((combination) => combination.index))

      Object.keys(rows).forEach((key) => {
        const index = Number(key)

        if (!validIndexes.has(index)) {
          revokeRowPreview(rows[index])
          delete rows[index]
        }
      })

      newCombinations.forEach((combination) => {
        if (!rows[combination.index]) {
          rows[combination.index] = { price: 0, image: null, previewUrl: null }
        }
      })
    },
    { immediate: true },
  )

  function setVariantImage(index: number, file: File) {
    const row = rows[index]

    if (!row) return

    revokeRowPreview(row)
    row.image = file
    row.previewUrl = URL.createObjectURL(file)
  }

  function clearVariantImage(index: number) {
    const row = rows[index]

    if (!row) return

    revokeRowPreview(row)
    row.image = null
    row.previewUrl = null
  }

  function validateRows(): string[] {
    const errors: string[] = []

    if (combinations.value.length === 0) {
      errors.push('Selecciona, al menos, una combinación de color y material.')
      return errors
    }

    combinations.value.forEach((combination) => {
      const result = frameVariantRowSchema.safeParse(rows[combination.index])

      if (!result.success) {
        errors.push(`Variante ${combination.sku}: revisa el precio capturado.`)
      }
    })

    return errors
  }

  function reset() {
    Object.keys(rows).forEach((key) => {
      const index = Number(key)

      revokeRowPreview(rows[index])
      delete rows[index]
    })
  }

  return {
    colorOptions,
    materialOptions,
    combinations,
    rows,
    setVariantImage,
    clearVariantImage,
    validateRows,
    reset,
  }
}
