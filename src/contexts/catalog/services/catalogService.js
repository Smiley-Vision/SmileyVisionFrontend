import { api } from '@/shared/infrastructure/http/api'

export async function getProductTypesService() {
    return (await api.get('product-types')).data
}

export async function getMicasService() {
    return (await api.get('micas')).data
}

export async function getArmazonesService() {
    return (await api.get('armazones')).data
}

export async function getEquiposService() {
    return (await api.get('equipos')).data
}

export async function searchProductsService(query, typeId) {
    return (await api.get(`products/query/${query}/${typeId}`)).data
}

export async function getProductByCodeService(code) {
    return (await api.get(`products/${code}`)).data
}

export async function getProductExistenceService(productId, officeId = null) {
    if (officeId) {
        return (await api.get(`product-existence/${productId}/${officeId}`)).data
    }

    return (await api.get(`product-existence/${productId}`)).data
}
