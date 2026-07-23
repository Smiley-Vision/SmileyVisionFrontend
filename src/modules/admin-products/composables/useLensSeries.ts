import { computed, reactive } from 'vue'

import {
  lensRangesOverlap,
  lensSeriesRowSchema,
} from '@/modules/admin-products/schemas/lensSeriesRowSchema'

export interface LensSeriesRow {
  id: number
  price: number
  sphereMin: number
  sphereMax: number
  cylinderMin: number
  cylinderMax: number
  image: File | null
  previewUrl: string | null
}

let nextSeriesId = 0

function createSeries(): LensSeriesRow {
  nextSeriesId += 1

  return {
    id: nextSeriesId,
    price: 0,
    sphereMin: -6,
    sphereMax: 6,
    cylinderMin: 0,
    cylinderMax: -6,
    image: null,
    previewUrl: null,
  }
}

function revokePreview(row?: LensSeriesRow) {
  if (row?.previewUrl) URL.revokeObjectURL(row.previewUrl)
}

export function useLensSeries() {
  const series = reactive<LensSeriesRow[]>([createSeries()])

  function addSeries() {
    series.push(createSeries())
  }

  function removeSeries(index: number) {
    if (series.length <= 1) return

    revokePreview(series[index])
    series.splice(index, 1)
  }

  function setSeriesImage(index: number, file: File) {
    const row = series[index]

    if (!row) return

    revokePreview(row)
    row.image = file
    row.previewUrl = URL.createObjectURL(file)
  }

  function clearSeriesImage(index: number) {
    const row = series[index]

    if (!row) return

    revokePreview(row)
    row.image = null
    row.previewUrl = null
  }

  const rowErrors = computed(() => {
    return series.map((row) => {
      const result = lensSeriesRowSchema.safeParse(row)

      return result.success ? [] : result.error.issues.map((issue) => issue.message)
    })
  })

  const overlapWarnings = computed(() => {
    const warnings: string[] = []

    for (let left = 0; left < series.length; left += 1) {
      if (rowErrors.value[left].length > 0) continue

      for (let right = left + 1; right < series.length; right += 1) {
        if (rowErrors.value[right].length > 0) continue

        if (lensRangesOverlap(series[left], series[right])) {
          warnings.push(`La Serie ${left + 1} se cruza con la Serie ${right + 1}.`)
        }
      }
    }

    return warnings
  })

  const isValid = computed(() => rowErrors.value.every((errors) => errors.length === 0))

  function reset() {
    series.forEach(revokePreview)
    series.splice(0, series.length, createSeries())
  }

  return {
    series,
    addSeries,
    removeSeries,
    setSeriesImage,
    clearSeriesImage,
    rowErrors,
    overlapWarnings,
    isValid,
    reset,
  }
}
