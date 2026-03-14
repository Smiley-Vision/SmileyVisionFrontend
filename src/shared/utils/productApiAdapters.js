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
    if (Array.isArray(payload?.products)) return payload.products

    return []
}

export function buildProductItemsByProductId(payload) {
    const items = Array.isArray(payload) ? payload : Array.isArray(payload?.product_items) ? payload.product_items : []

    return items.reduce((map, item) => {
        if (item?.product_id != null) {
            map[item.product_id] = item
        }

        return map
    }, {})
}

export function enrichProduct(product, productItemsByProductId = {}) {
    if (!product || typeof product !== 'object') return product

    const productId = product.id ?? product.product_id ?? null
    const item = productId != null ? productItemsByProductId[productId] : null

    return {
        ...product,
        product_item_id: product.product_item_id ?? item?.id ?? null,
        code: product.code ?? product.SKU ?? item?.SKU ?? String(productId ?? ''),
        price: product.price ?? item?.price ?? null,
        image_url: product.image_url ?? product.product_image ?? item?.product_image ?? ''
    }
}

export function enrichProducts(products, productItemsByProductId = {}) {
    return products.map((product) => enrichProduct(product, productItemsByProductId))
}
