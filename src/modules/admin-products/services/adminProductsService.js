import { api } from '@/modules/shared/infrastructure/http/api'

export async function getAdminProductTypesService() {
  return (await api.get('product-categories')).data
}

export async function getSuppliersService() {
  return (await api.get('suppliers')).data
}

export async function getSuppliersByProductCategoryService(categoryId) {
  return (await api.get(`product-categories/${categoryId}/suppliers`)).data
}

export async function searchAdminProductsService(query, typeId) {
  return (
    await api.get('products/search', {
      params: {
        searchQuery: query,
        categoryID: typeId,
      },
    })
  ).data
}

export async function createProductService(formData) {
  return (await api.post('products', formData)).data
}

export async function getVariationsService() {
  return (await api.get('variations')).data
}

export async function createEquipmentItemService(formData) {
  return (await api.post('product-items/equipment', formData)).data
}

export async function createFrameItemService(formData) {
  return (await api.post('product-items/frame', formData)).data
}

export async function createProductItemService(formData) {
  return (await api.post('product-items', formData)).data
}

export async function getMicasProductsService() {
  return (await api.get('products/micas')).data
}

export async function batchCreateLensItemsService(payload) {
  return (await api.post('product-items/batch-lenses', payload)).data
}

export async function getProductItemsService() {
  return (await api.get('product-items')).data
}

export async function updateProductItemImageService(productItemId, formData) {
  return (await api.post(`product-items/${productItemId}/image`, formData)).data
}

export async function updateProductItemService(productItemId, body) {
  return (await api.patch(`product-items/${productItemId}`, body)).data
}

export async function getProductStateService(code) {
  return (await api.get(`products/${code}`)).data
}

export async function updateProductService(code, body) {
  return (await api.patch(`products/${code}`, body)).data
}

export async function deleteProductService(code) {
  return (await api.delete(`products/${code}`)).data
}
