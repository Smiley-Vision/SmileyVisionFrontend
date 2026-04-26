import { api } from '@/shared/infrastructure/http/api'

export async function getAdminProductTypesService() {
    return (await api.get('product-categories')).data
}

export async function getSuppliersService() {
    return (await api.get('suppliers')).data
}

export async function searchAdminProductsService(query, typeId) {
    return (await api.get('products/search', {
        params: {
            searchQuery: query,
            categoryID: typeId
        }
    })).data
}

export async function createProductService(formData) {
    return (await api.post('products', formData)).data
}

export async function getMicasProductsService() {
    return (await api.get('products/micas')).data
}

export async function batchCreateLensItemsService(payload) {
    return (await api.post('product-items/batch-lenses', payload)).data
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
