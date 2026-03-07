import { api } from '@/shared/infrastructure/http/api'

export async function getInventoryProductTypesService() {
    return (await api.get('product-types')).data
}

export async function searchInventoryProductsService(query, typeId) {
    return (await api.get(`products/query/${query}/${typeId}`)).data
}

export async function getOfficesService() {
    return (await api.get('offices')).data
}

export async function getProductStockService(productId, officeId = null) {
    if (officeId) {
        return (await api.get(`product-existence/${productId}/${officeId}`)).data
    }

    return (await api.get(`product-existence/${productId}`)).data
}

export async function updateProductStockService(body) {
    return (await api.post('product-existence', body)).data
}
