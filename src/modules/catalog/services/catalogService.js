import smileyApi from '@/modules/core/api/smileyApi'

/**
 * The backend paginates `products` and `product-items`, but most callers
 * (cart enrichment, admin listings) need the complete catalog rather than
 * a single page. Walk every page and return the flattened result.
 */
async function fetchAllPages(path) {
  const items = []
  let page = 1
  let lastPage = 1

  do {
    const { data: payload } = await smileyApi.get(path, { params: { page } })
    const pageItems = Array.isArray(payload?.data) ? payload.data : []

    items.push(...pageItems)
    lastPage = Number(payload?.meta?.last_page) || 1
    page += 1
  } while (page <= lastPage)

  return items
}

export async function getProductTypesService() {
  return (await smileyApi.get('product-categories')).data
}

export async function getMicasService() {
  return (await smileyApi.get('products/micas')).data
}

export async function getArmazonesService() {
  return (await smileyApi.get('products/armazones')).data
}

export async function getEquiposService() {
  return (await smileyApi.get('products/equipos')).data
}

export async function searchProductsService(query, typeId) {
  return (
    await smileyApi.get('products/search', {
      params: {
        searchQuery: query,
        categoryID: typeId,
      },
    })
  ).data
}

export async function getProductByCodeService(code) {
  return (await smileyApi.get(`products/${code}`)).data
}

export async function getProductsService() {
  return fetchAllPages('products')
}

export async function getProductItemsService() {
  return fetchAllPages('product-items')
}

export async function getProductConfigurationsService() {
  return (await smileyApi.get('product-configurations')).data
}
