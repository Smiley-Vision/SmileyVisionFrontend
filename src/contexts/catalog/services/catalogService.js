import { api } from '@/shared/infrastructure/http/api'

export async function getProductTypesService() {
    return (await api.get('product-categories')).data
}

export async function getMicasService() {
    return (await api.get('products/micas')).data
}

export async function getArmazonesService() {
    return (await api.get('products/armazones')).data
}

export async function getEquiposService() {
    return (await api.get('products/equipos')).data
}

export async function searchProductsService(query, typeId) {
    return (await api.get('products/search', {
        params: {
            searchQuery: query,
            categoryID: typeId
        }
    })).data
}

export async function getProductByCodeService(code) {
    return (await api.get(`products/${code}`)).data
}

export async function getProductsService() {
    return (await api.get('products')).data
}

export async function getProductItemsService() {
    return (await api.get('product-items')).data
}

export async function getProductConfigurationsService() {
    return (await api.get('product-configurations')).data
}
