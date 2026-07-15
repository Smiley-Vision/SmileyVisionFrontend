import smileyApi from '@/modules/core/api/smileyApi'

import type { Product } from '@/modules/admin-products/interfaces/Product'

interface CreateProductResponse {
  message: string
  product: Product
}

export async function createProductService(formData: FormData) {
  return (await smileyApi.post<CreateProductResponse>('/products', formData)).data
}
