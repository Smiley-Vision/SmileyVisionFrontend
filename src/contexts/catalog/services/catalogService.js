import { fetchData } from '@/shared/infrastructure/http/api'

export async function getProductTypesService() {
    return fetchData('product-types', 'GET')
}

export async function getMicasService() {
    return fetchData('micas', 'GET')
}

export async function getArmazonesService() {
    return fetchData('armazones', 'GET')
}

export async function getEquiposService() {
    return fetchData('equipos', 'GET')
}

export async function searchProductsService(query, typeId) {
    return fetchData(`products/query/${query}/${typeId}`, 'GET')
}

export async function getProductByCodeService(code) {
    return fetchData(`products/${code}`, 'GET')
}

export async function getProductExistenceService(productId, officeId = null) {
    if (officeId) {
        return fetchData(`product-existence/${productId}/${officeId}`, 'GET')
    }

    return fetchData(`product-existence/${productId}`, 'GET')
}
