import smileyApi from '@/modules/core/api/smileyApi'

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
  return (await smileyApi.get('products')).data
}

export async function getProductItemsService() {
  return (await smileyApi.get('product-items')).data
}

export async function getProductConfigurationsService() {
  return (await smileyApi.get('product-configurations')).data
}
