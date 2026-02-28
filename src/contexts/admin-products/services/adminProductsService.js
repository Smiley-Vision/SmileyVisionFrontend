import { api } from '@/shared/infrastructure/http/api'

export async function getAdminProductTypesService() {
    return (await api.get('product-types')).data
}

export async function searchAdminProductsService(query, typeId) {
    return (await api.get(`products/query/${query}/${typeId}`)).data
}

export async function createProductService(formData) {
    return (await api.post('products', formData)).data
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
