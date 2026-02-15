import { fetchData } from '@/shared/infrastructure/http/api'

export async function getInventoryProductTypesService() {
    return fetchData('product-types', 'GET')
}

export async function searchInventoryProductsService(query, typeId) {
    return fetchData(`products/query/${query}/${typeId}`, 'GET')
}

export async function getOfficesService() {
    return fetchData('offices', 'GET')
}

export async function getProductStockService(productId, officeId = null) {
    if (officeId) {
        return fetchData(`product-existence/${productId}/${officeId}`, 'GET')
    }

    return fetchData(`product-existence/${productId}`, 'GET')
}

export async function updateProductStockService(body) {
    return fetchData('product-existence', 'POST', body)
}
