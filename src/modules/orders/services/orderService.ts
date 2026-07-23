import smileyApi from '@/modules/core/api/smileyApi'
import type { Order, Paginated } from '@/modules/orders/interfaces/Order'

interface OrderResponse {
  message: string
  data: Order
}

export async function createOrderService() {
  return (await smileyApi.post<OrderResponse>('orders')).data
}

export async function getOrdersService(
  page = 1,
  filters: { status?: string; month?: number; year?: number } = {},
) {
  return (
    await smileyApi.get<Paginated<Order>>('orders', {
      params: { page, ...filters },
    })
  ).data
}

export async function getOrderService(id: number) {
  return (await smileyApi.get<{ data: Order }>(`orders/${id}`)).data
}

export interface UpdateOrderStatusPayload {
  status: string
  shipping_cost?: number
  delivery_deadline?: string
  note?: string
}

export async function updateOrderStatusService(id: number, payload: UpdateOrderStatusPayload) {
  return (await smileyApi.patch<OrderResponse>(`orders/${id}/status`, payload)).data
}

export async function downloadOrderReportService(
  type: 'monthly' | 'weekly',
  params: Record<string, string | number>,
) {
  const response = await smileyApi.get(`orders/reports/${type}`, {
    params,
    responseType: 'blob',
  })

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.download = `pedidos-reporte.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
