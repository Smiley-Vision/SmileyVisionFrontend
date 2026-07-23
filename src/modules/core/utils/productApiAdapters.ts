interface LensSourceItem {
  SKU?: unknown
  price?: unknown
  product_image?: unknown
  stock?: unknown
  total_stock?: unknown
  available_stock?: unknown
  availability?: unknown
  existence?: unknown
  inventory?: unknown
  inventories?: unknown
  inventory_items?: unknown
}

interface LensValues {
  sphere: number
  cylinder: number
}

export interface LensSeries<T extends LensSourceItem = LensSourceItem> {
  key: string
  label: string
  price: number
  image_url: string
  items: T[]
  sphereMin: number | null
  sphereMax: number | null
  cylinderMin: number | null
  cylinderMax: number | null
  representativeItem: T | null
  totalStock: number
}

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function getCategorySlug(categoryName: unknown): string {
  const normalized = normalizeText(categoryName)

  if (normalized.includes('mica')) return 'micas'
  if (normalized.includes('armazon')) return 'armazones'
  if (normalized.includes('equipo')) return 'equipos'

  return normalized.replace(/\s+/g, '-')
}

function getProductItemStock(item: LensSourceItem | null | undefined): number {
  const directStock = [
    item?.stock,
    item?.total_stock,
    item?.available_stock,
    item?.availability,
    item?.existence,
  ]
    .map((value) => {
      const parsed = Number(value)

      return Number.isFinite(parsed) ? parsed : null
    })
    .find((value) => value !== null)

  if (directStock !== undefined) return Math.max(0, directStock)

  const inventoryRows = Array.isArray(item?.inventory)
    ? item.inventory
    : Array.isArray(item?.inventories)
      ? item.inventories
      : Array.isArray(item?.inventory_items)
        ? item.inventory_items
        : []

  return inventoryRows.reduce((total: number, inventoryRow: LensSourceItem) => {
    const stock = Number(inventoryRow?.stock)

    return total + Math.max(0, Number.isFinite(stock) ? stock : 0)
  }, 0)
}

function chooseRepresentativeProductItem<T extends LensSourceItem>(items: T[]): T | null {
  if (!Array.isArray(items) || items.length === 0) return null

  return items.find((item) => getProductItemStock(item) > 0) ?? items[0]
}

export function parseLensSku(sku: unknown): LensValues | null {
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

  if (spherePrefix === 'N') {
    sphere = -sphereMagnitude
  } else if (spherePrefix === 'P') {
    sphere = sphereMagnitude
  }

  return {
    sphere: Number(sphere.toFixed(2)),
    cylinder: Number((cylinderPrefix === 'N' ? -cylinderMagnitude : cylinderMagnitude).toFixed(2)),
  }
}

export function formatLensValue(value: unknown): string {
  const numericValue = Number(value ?? 0)

  return numericValue === 0 || Object.is(numericValue, -0) ? '0.00' : numericValue.toFixed(2)
}

export function getDistinctLensValues(items: LensSourceItem[] | null | undefined): {
  spheres: number[]
  cylinders: number[]
} {
  const spheres = new Set<number>()
  const cylinders = new Set<number>()

  for (const item of Array.isArray(items) ? items : []) {
    const parsedLens = parseLensSku(item?.SKU)
    if (!parsedLens) continue

    spheres.add(parsedLens.sphere)
    cylinders.add(parsedLens.cylinder)
  }

  return {
    spheres: [...spheres].sort((left, right) => left - right),
    cylinders: [...cylinders].sort((left, right) => left - right),
  }
}

export function findLensItemBySphereCylinder<T extends LensSourceItem>(
  items: T[] | null | undefined,
  sphere: number,
  cylinder: number,
): T | null {
  return (
    (Array.isArray(items) ? items : []).find((item) => {
      const parsedLens = parseLensSku(item?.SKU)
      return parsedLens !== null && parsedLens.sphere === sphere && parsedLens.cylinder === cylinder
    }) ?? null
  )
}

export function buildLensSeries<T extends LensSourceItem>(
  productItems: T[] | null | undefined,
  productImage: unknown = '',
): LensSeries<T>[] {
  const groups = new Map<string, LensSeries<T>>()

  for (const item of Array.isArray(productItems) ? productItems : []) {
    const parsedLens = parseLensSku(item?.SKU)
    const price = Number(item?.price ?? 0)
    const image = String(item?.product_image || productImage || '').trim()
    const key = `${Number.isFinite(price) ? price.toFixed(2) : '0.00'}|${image}`

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: '',
        price: Number.isFinite(price) ? price : 0,
        image_url: image,
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
      group.sphereMin =
        group.sphereMin === null ? parsedLens.sphere : Math.min(group.sphereMin, parsedLens.sphere)
      group.sphereMax =
        group.sphereMax === null ? parsedLens.sphere : Math.max(group.sphereMax, parsedLens.sphere)
      group.cylinderMin =
        group.cylinderMin === null
          ? parsedLens.cylinder
          : Math.min(group.cylinderMin, parsedLens.cylinder)
      group.cylinderMax =
        group.cylinderMax === null
          ? parsedLens.cylinder
          : Math.max(group.cylinderMax, parsedLens.cylinder)
    }
  }

  return [...groups.values()]
    .map((series, index) => ({
      ...series,
      label: `Serie ${index + 1}`,
      representativeItem: chooseRepresentativeProductItem(series.items),
      totalStock: series.items.reduce((total, item) => total + getProductItemStock(item), 0),
    }))
    .sort((left, right) => {
      if (left.price !== right.price) return left.price - right.price
      return left.label.localeCompare(right.label, 'es')
    })
}
