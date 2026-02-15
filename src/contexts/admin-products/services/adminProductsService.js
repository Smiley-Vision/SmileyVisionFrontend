import { fetchData } from '@/shared/infrastructure/http/api'

export async function getAdminProductTypesService() {
    return fetchData('product-types', 'GET')
}

export async function searchAdminProductsService(query, typeId) {
    return fetchData(`products/query/${query}/${typeId}`, 'GET')
}

export async function createProductService(formData) {
    return fetchData('products', 'POST', formData)
}

export async function getProductStateService(code) {
    return fetchData(`products/${code}`, 'GET')
}

export async function updateProductService(code, body) {
    return fetchData(`products/${code}`, 'PATCH', body)
}

export async function deleteProductService(code) {
    return fetchData(`products/${code}`, 'DELETE')
}
