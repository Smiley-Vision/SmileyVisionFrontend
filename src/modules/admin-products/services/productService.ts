import smileyApi from '@/modules/core/api/smileyApi'

import type { Product } from '@/modules/admin-products/interfaces/Product'

interface CreateProductResponse {
  message: string
  product: Product
}

interface ShowProductResponse {
  data: Product
}

interface UpdateProductPayload {
  name: string
  description: string
}

export async function createProductService(formData: FormData) {
  return (await smileyApi.post<CreateProductResponse>('/products', formData)).data
}

export async function getProductService(productId: number) {
  return (await smileyApi.get<ShowProductResponse>(`/products/${productId}`)).data
}

export async function updateProductService(productId: number, payload: UpdateProductPayload) {
  return (await smileyApi.patch<CreateProductResponse>(`/products/${productId}`, payload)).data
}

export async function deleteProductService(productId: number) {
  return (await smileyApi.delete<CreateProductResponse>(`/products/${productId}`)).data
}
