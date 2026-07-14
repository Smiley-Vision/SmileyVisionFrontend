import type { ProductConfiguration } from '@/modules/catalog/interfaces/ProductConfiguration'
import type { ProductItem } from '@/modules/catalog/interfaces/ProductItem'

export interface FrameVariation {
  name: string
  options: string[]
}

export interface FrameItemEntry {
  item: ProductItem
  configByVariation: Record<string, string>
}

export interface FrameVariantData {
  variations: FrameVariation[]
  items: FrameItemEntry[]
}

function normalizeVariationName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const VARIATION_DISPLAY_ORDER: Record<string, number> = { color: 1, material: 2 }

function sortVariations(left: FrameVariation, right: FrameVariation): number {
  const leftOrder = VARIATION_DISPLAY_ORDER[normalizeVariationName(left.name)] ?? 99
  const rightOrder = VARIATION_DISPLAY_ORDER[normalizeVariationName(right.name)] ?? 99

  if (leftOrder !== rightOrder) return leftOrder - rightOrder
  return left.name.localeCompare(right.name, 'es')
}

/**
 * Builds the variation/option matrix for a frame product straight from
 * `GET /product-configurations/{item}` (flat `{variation, value}` pairs per
 * item), instead of guessing color from the item's SKU/image filename.
 */
export function buildFrameVariantData(
  items: ProductItem[],
  configurationsByItemId: Map<number, ProductConfiguration[]>,
): FrameVariantData {
  const optionsByVariation = new Map<string, Set<string>>()

  const entries: FrameItemEntry[] = items.map((item) => {
    const configurations = configurationsByItemId.get(item.id) ?? []
    const configByVariation: Record<string, string> = {}

    for (const configuration of configurations) {
      configByVariation[configuration.variation] = configuration.value

      if (!optionsByVariation.has(configuration.variation)) {
        optionsByVariation.set(configuration.variation, new Set())
      }
      optionsByVariation.get(configuration.variation)!.add(configuration.value)
    }

    return { item, configByVariation }
  })

  const variations = [...optionsByVariation.entries()]
    .map(([name, options]) => ({
      name,
      options: [...options].sort((left, right) => left.localeCompare(right, 'es')),
    }))
    .sort(sortVariations)

  return { variations, items: entries }
}

export function isFrameOptionAvailable(
  frameVariantData: FrameVariantData,
  selectedOptions: Record<string, string>,
  variationName: string,
  optionValue: string,
): boolean {
  const otherSelections = Object.entries(selectedOptions).filter(
    ([name]) => name !== variationName,
  )

  return frameVariantData.items.some(
    (entry) =>
      entry.configByVariation[variationName] === optionValue &&
      otherSelections.every(([name, value]) => entry.configByVariation[name] === value),
  )
}

export function findMatchingFrameItem(
  frameVariantData: FrameVariantData,
  selectedOptions: Record<string, string>,
): ProductItem | null {
  const selectedEntries = Object.entries(selectedOptions)

  if (selectedEntries.length === 0) {
    return frameVariantData.items[0]?.item ?? null
  }

  const match = frameVariantData.items.find((entry) =>
    selectedEntries.every(([name, value]) => entry.configByVariation[name] === value),
  )

  return match?.item ?? null
}
