import { api } from '@/modules/shared/infrastructure/http/api'

export async function getInventoryProductTypesService() {
  return (await api.get('product-categories')).data
}

export async function searchInventoryProductsService(query, typeId) {
  return (
    await api.get('products/search', {
      params: {
        searchQuery: query,
        categoryID: typeId,
      },
    })
  ).data
}

export async function getProductItemsService() {
  return (await api.get('product-items')).data
}

export async function updateProductStockService(body) {
  return (await api.post('inventory', body)).data
}
