import smileyApi from '@/modules/core/api/smileyApi'

import type { Product } from '@/modules/admin-products/interfaces/Product'

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export async function getAllProductsService(page = 1) {
  return (
    await smileyApi.get<PaginatedResponse<Product>>('/products', {
      params: { page },
    })
  ).data
}
