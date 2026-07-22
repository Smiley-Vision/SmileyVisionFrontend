import type { Paginated } from '@/modules/catalog/interfaces/Pagination'
import type { Product } from '@/modules/catalog/interfaces/Product'
import type { ProductCategory } from '@/modules/catalog/interfaces/ProductCategory'
import type { ProductConfiguration } from '@/modules/catalog/interfaces/ProductConfiguration'
import type { ProductItem } from '@/modules/catalog/interfaces/ProductItem'
import type { Supplier } from '@/modules/catalog/interfaces/Supplier'
import smileyApi from '@/modules/core/api/smileyApi'

export const DEFAULT_PAGE_SIZE = 12

export interface ProductListParams {
  page?: number
  perPage?: number
  query?: string
}

export interface CategoryProductListParams extends ProductListParams {
  supplierId?: number | null
}

/**
 * Walks every page of a paginated endpoint and flattens the result.
 * Used where the caller needs an entire (bounded) collection rather than
 * a single page, e.g. every product-item belonging to one product.
 */
async function fetchAllPages<T>(
  path: string,
  extraParams: Record<string, unknown> = {},
): Promise<T[]> {
  const items: T[] = []
  let page = 1
  let lastPage = 1

  do {
    const { data } = await smileyApi.get<Paginated<T>>(path, {
      params: { ...extraParams, page },
    })

    items.push(...(Array.isArray(data?.data) ? data.data : []))
    lastPage = Number(data?.meta?.last_page) || 1
    page += 1
  } while (page <= lastPage)

  return items
}

export async function getCategories(): Promise<ProductCategory[]> {
  const { data } = await smileyApi.get<{ data: ProductCategory[] }>('categories')

  return data.data
}

export async function getCategorySuppliers(categoryId: number): Promise<Supplier[]> {
  const { data } = await smileyApi.get<{ data: Supplier[] }>(`categories/${categoryId}/suppliers`)

  return data.data
}

export async function getProducts(params: ProductListParams = {}): Promise<Paginated<Product>> {
  const { data } = await smileyApi.get<Paginated<Product>>('products', {
    params: {
      page: params.page,
      per_page: params.perPage ?? DEFAULT_PAGE_SIZE,
      query: params.query || undefined,
    },
  })

  return data
}

export async function getProductsByCategory(
  categoryId: number,
  params: CategoryProductListParams = {},
): Promise<Paginated<Product>> {
  const { data } = await smileyApi.get<Paginated<Product>>(`categories/${categoryId}/products`, {
    params: {
      page: params.page,
      per_page: params.perPage ?? DEFAULT_PAGE_SIZE,
      query: params.query || undefined,
      supplier_id: params.supplierId || undefined,
    },
  })

  return data
}

export async function getProductById(id: number): Promise<Product> {
  const { data } = await smileyApi.get<{ data: Product }>(`products/${id}`)

  return data.data
}

export async function getProductItemsByProductId(productId: number): Promise<ProductItem[]> {
  return fetchAllPages<ProductItem>('product-items', { product_id: productId })
}

export async function getProductItemById(itemId: number): Promise<ProductItem> {
  const { data } = await smileyApi.get<{ data: ProductItem }>(`product-items/${itemId}`)

  return data.data
}

export async function getProductConfigurationsByItem(
  itemId: number,
): Promise<ProductConfiguration[]> {
  const { data } = await smileyApi.get<{ data: ProductConfiguration[] }>(
    `product-configurations/${itemId}`,
  )

  return data.data
}
