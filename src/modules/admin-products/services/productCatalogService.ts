import type { Product } from '@/modules/admin-products/interfaces/Product'
import type { ProductCategory } from '@/modules/admin-products/interfaces/ProductCategory'
import type { Supplier } from '@/modules/admin-products/interfaces/Supplier'
import type { Variation } from '@/modules/admin-products/interfaces/Variation'
import smileyApi from '@/modules/core/api/smileyApi'

interface ApiListResponse<T> {
  data: T[]
}

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export async function getCategoriesService() {
  return (await smileyApi.get<ApiListResponse<ProductCategory>>('/categories')).data
}

export async function getSuppliersByCategoryService(categoryId: number) {
  return (await smileyApi.get<ApiListResponse<Supplier>>(`/categories/${categoryId}/suppliers`))
    .data
}

export async function getVariationsByCategoryService(categoryId: number) {
  return (await smileyApi.get<ApiListResponse<Variation>>(`/variations/category/${categoryId}`))
    .data
}

export async function getProductsByCategoryService(categoryId: number, query = '', page = 1) {
  return (
    await smileyApi.get<PaginatedResponse<Product>>(`/categories/${categoryId}/products`, {
      params: { page, ...(query ? { query } : undefined) },
    })
  ).data
}
