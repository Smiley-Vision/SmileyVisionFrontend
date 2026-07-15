import smileyApi from '@/modules/core/api/smileyApi'

import type { Product } from '@/modules/admin-products/interfaces/Product'
import type { ProductItem } from '@/modules/admin-products/interfaces/ProductItem'

interface CreateProductItemResponse {
  message: string
  data: ProductItem
}

interface LensBatchPayload {
  productId: number
  price: number
  sphereMin: number
  sphereMax: number
  cylinderMin: number
  cylinderMax: number
  image?: File | null
}

interface LensBatchResult {
  product: Product
  created_count: number
  skipped_count: number
  total_count: number
}

interface LensBatchResponse {
  message: string
  data: LensBatchResult
}

export async function createEquipmentItemService(formData: FormData) {
  return (
    await smileyApi.post<CreateProductItemResponse>('/product-items/equipments', formData)
  ).data
}

export async function createFrameItemService(formData: FormData) {
  return (await smileyApi.post<CreateProductItemResponse>('/product-items/frames', formData)).data
}

export async function createLensBatchService(payload: LensBatchPayload) {
  const formData = new FormData()

  formData.append('product_id', String(payload.productId))
  formData.append('price', payload.price.toFixed(2))
  formData.append('sphere[min]', payload.sphereMin.toFixed(2))
  formData.append('sphere[max]', payload.sphereMax.toFixed(2))
  formData.append('cylinder[min]', payload.cylinderMin.toFixed(2))
  formData.append('cylinder[max]', payload.cylinderMax.toFixed(2))

  if (payload.image) {
    formData.append('image', payload.image)
  }

  return (await smileyApi.post<LensBatchResponse>('/product-items/lenses', formData)).data
}

export async function updateItemImageService(itemId: number, formData: FormData) {
  return (
    await smileyApi.post<CreateProductItemResponse>(`/product-items/${itemId}/image`, formData)
  ).data
}
