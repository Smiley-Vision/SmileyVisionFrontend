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
        item?.existence
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

function chooseRepresentativeProductItem(items) {
    if (!Array.isArray(items) || items.length === 0) return null

    return items.find((item) => getProductItemStock(item) > 0 && item?.product_image)
        ?? items.find((item) => item?.product_image)
        ?? items[0]
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
        image_url: item?.product_image ?? product.image_url ?? product.product_image ?? '',
        stock: getProductItemStock(item)
    }
}

export function enrichProducts(products, productItemsByProductId = {}) {
    return products.map((product) => enrichProduct(product, productItemsByProductId))
}
