import type { Product } from '@/modules/admin-products/interfaces/Product'
import smileyApi from '@/modules/core/api/smileyApi'

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export async function getAllProductsService(page = 1, query = '') {
  return (
    await smileyApi.get<PaginatedResponse<Product>>('/products', {
      params: { page, ...(query ? { query } : undefined) },
    })
  ).data
}
