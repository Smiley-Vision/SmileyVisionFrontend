import smileyApi from '@/modules/core/api/smileyApi'

import type { InventoryEntry } from '@/modules/inventory/interfaces/InventoryEntry'

interface ApiListResponse<T> {
  data: T[]
}

interface UpdateInventoryResponse {
  message: string
  data: {
    product_item_id: number
    branch_office_id: number
    stock: number
  }
}

interface BatchUpdateInventoryResponse {
  message: string
  updated: number
}

export async function getInventoryByOfficeService(officeId: number) {
  return (await smileyApi.get<ApiListResponse<InventoryEntry>>(`/inventory/${officeId}`)).data
}

export async function updateInventoryService(itemId: number, officeId: number, stock: number) {
  return (
    await smileyApi.post<UpdateInventoryResponse>(`/inventory/${itemId}/${officeId}`, { stock })
  ).data
}

export async function updateInventoryBatchService(
  itemIds: number[],
  officeId: number,
  stock: number,
) {
  return (
    await smileyApi.post<BatchUpdateInventoryResponse>(`/inventory/${officeId}/batch`, {
      item_ids: itemIds,
      stock,
    })
  ).data
}
