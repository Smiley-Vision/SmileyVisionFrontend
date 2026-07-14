import type { ProductItem } from '@/modules/catalog/interfaces/ProductItem'

export interface LensValues {
  sphere: number
  cylinder: number
}

export interface LensSeries {
  key: string
  label: string
  price: number
  image_path: string
  items: ProductItem[]
  sphereMin: number | null
  sphereMax: number | null
  cylinderMin: number | null
  cylinderMax: number | null
  representativeItem: ProductItem | null
  totalStock: number
}

/**
 * Lenses aren't modeled through product_configuration (they're created as a
 * cartesian batch of numeric sphere/cylinder values), so their attributes
 * are recovered by parsing the SKU pattern set by BatchCreateLensesAction:
 * -S[N|P]DDD-C[N]DDD (sphere/cylinder magnitudes x100, N = negative).
 */
export function parseLensSku(sku: string | undefined | null): LensValues | null {
  const normalizedSku = String(sku ?? '')
    .trim()
    .toUpperCase()
  const match = normalizedSku.match(/-S([NP]?)(\d{3})-C(N?)(\d{3})$/)

  if (!match) return null

  const spherePrefix = match[1]
  const sphereMagnitude = Number(match[2]) / 100
  const cylinderPrefix = match[3]
  const cylinderMagnitude = Number(match[4]) / 100

  let sphere = 0
  if (spherePrefix === 'N') sphere = -sphereMagnitude
  else if (spherePrefix === 'P') sphere = sphereMagnitude

  return {
    sphere: Number(sphere.toFixed(2)),
    cylinder: Number((cylinderPrefix === 'N' ? -cylinderMagnitude : cylinderMagnitude).toFixed(2)),
  }
}

export function formatLensValue(value: number | null | undefined): string {
  const numericValue = Number(value ?? 0)
  return numericValue === 0 || Object.is(numericValue, -0) ? '0.00' : numericValue.toFixed(2)
}

function chooseRepresentativeItem(items: ProductItem[]): ProductItem | null {
  if (items.length === 0) return null
  return items.find((item) => Number(item.stock) > 0) ?? items[0]
}

/**
 * Groups lens items sharing the same price/image into a "series" the user
 * can pick a quantity for, and derives the sphere/cylinder range of each
 * series from its items' SKUs for display.
 */
export function buildLensSeries(items: ProductItem[], fallbackImage = ''): LensSeries[] {
  const groups = new Map<string, LensSeries>()

  for (const item of items) {
    const parsedLens = parseLensSku(item.SKU)
    const price = Number(item.price ?? 0)
    const image = String(item.image_path || fallbackImage || '').trim()
    const key = `${Number.isFinite(price) ? price.toFixed(2) : '0.00'}|${image}`

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: '',
        price: Number.isFinite(price) ? price : 0,
        image_path: image,
        items: [],
        sphereMin: parsedLens?.sphere ?? null,
        sphereMax: parsedLens?.sphere ?? null,
        cylinderMin: parsedLens?.cylinder ?? null,
        cylinderMax: parsedLens?.cylinder ?? null,
        representativeItem: null,
        totalStock: 0,
      })
    }

    const group = groups.get(key)!
    group.items.push(item)

    if (parsedLens) {
      group.sphereMin = group.sphereMin === null ? parsedLens.sphere : Math.min(group.sphereMin, parsedLens.sphere)
      group.sphereMax = group.sphereMax === null ? parsedLens.sphere : Math.max(group.sphereMax, parsedLens.sphere)
      group.cylinderMin =
        group.cylinderMin === null ? parsedLens.cylinder : Math.min(group.cylinderMin, parsedLens.cylinder)
      group.cylinderMax =
        group.cylinderMax === null ? parsedLens.cylinder : Math.max(group.cylinderMax, parsedLens.cylinder)
    }
  }

  return [...groups.values()]
    .map((series, index) => ({
      ...series,
      label: `Serie ${index + 1}`,
      representativeItem: chooseRepresentativeItem(series.items),
      totalStock: series.items.reduce((total, item) => total + Number(item.stock ?? 0), 0),
    }))
    .sort((left, right) => {
      if (left.price !== right.price) return left.price - right.price
      return left.label.localeCompare(right.label, 'es')
    })
}
