function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function getCategorySlug(categoryName) {
  const normalized = normalizeText(categoryName)

  if (normalized.includes('mica')) return 'micas'
  if (normalized.includes('armazon')) return 'armazones'
  if (normalized.includes('equipo')) return 'equipos'

  return normalized.replace(/\s+/g, '-')
}

export function getShopRouteNameByCategory(categoryName) {
  const slug = getCategorySlug(categoryName)

  if (slug === 'micas') return 'shop-Micas'
  if (slug === 'armazones') return 'shop-Armazones'
  if (slug === 'equipos') return 'shop-Equipos'

  return 'shop'
}

export function findCategoryIdByName(categories, categoryName) {
  const targetSlug = getCategorySlug(categoryName)
  const match = categories.find((category) => getCategorySlug(category?.name) === targetSlug)

  return match?.id ?? null
}

export function normalizeCategoriesPayload(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.categories)) return payload.categories

  return []
}

export function normalizeProductListPayload(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.products)) return payload.products

  return []
}

export function buildProductItemsByProductId(payload) {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.product_items)
        ? payload.product_items
        : []

  const itemsByProductId = items.reduce((map, item) => {
    if (item?.product_id != null) {
      if (!Array.isArray(map[item.product_id])) {
        map[item.product_id] = []
      }

      map[item.product_id].push(item)
    }

    return map
  }, {})

  return Object.entries(itemsByProductId).reduce((map, [productId, productItems]) => {
    map[productId] = chooseRepresentativeProductItem(productItems)

    return map
  }, {})
}

export function getProductItemStock(item) {
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

  return inventoryRows.reduce((total, inventoryRow) => {
    const stock = Number(inventoryRow?.stock)

    return total + Math.max(0, Number.isFinite(stock) ? stock : 0)
  }, 0)
}

export function chooseRepresentativeProductItem(items) {
  if (!Array.isArray(items) || items.length === 0) return null

  return items.find((item) => getProductItemStock(item) > 0) ?? items[0]
}

export function enrichProduct(product, productItemsByProductId = {}) {
  if (!product || typeof product !== 'object') return product

  const productId = product.id ?? product.product_id ?? null
  const item = productId != null ? productItemsByProductId[productId] : null
  const productImage = product.image_url ?? product.product_image ?? ''

  return {
    ...product,
    product_item_id: product.product_item_id ?? item?.id ?? null,
    code: product.code ?? product.SKU ?? item?.SKU ?? String(productId ?? ''),
    price: product.price ?? item?.price ?? null,
    image_url: productImage,
    stock: getProductItemStock(item),
  }
}

export function enrichProducts(products, productItemsByProductId = {}) {
  return products.map((product) => enrichProduct(product, productItemsByProductId))
}

export function parseLensSku(sku) {
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

export function formatLensValue(value) {
  const numericValue = Number(value ?? 0)

  return numericValue === 0 || Object.is(numericValue, -0) ? '0.00' : numericValue.toFixed(2)
}

export function buildLensSeries(productItems, productImage = '') {
  const groups = new Map()

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
      })
    }

    const group = groups.get(key)
    group.items.push({
      ...item,
      sphere: parsedLens?.sphere ?? null,
      cylinder: parsedLens?.cylinder ?? null,
    })

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
      id: series.key,
      label: `Serie ${index + 1}`,
      representativeItem: chooseRepresentativeProductItem(series.items),
      totalStock: series.items.reduce((total, item) => total + getProductItemStock(item), 0),
    }))
    .sort((left, right) => {
      if (left.price !== right.price) return left.price - right.price
      return left.label.localeCompare(right.label, 'es')
    })
}
