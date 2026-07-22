import type { Address } from '@/modules/user/interfaces/Address'

export interface OrderItem {
  id: number
  order_id: number
  product_item_id: number
  product_name: string
  SKU: string
  quantity: number
  unit_price: string
}

export interface OrderStatusHistoryEntry {
  id: number
  status: string
  note: string | null
  created_at: string
}

export type OrderStatusName = 'pendiente' | 'procesando' | 'enviado' | 'completado' | 'cancelado'

export interface Order {
  id: number
  optician_id: number
  optician_name?: string
  branch_office_id: number
  branch_office_name?: string
  delivery_address?: Address
  current_status: OrderStatusName
  shipping_cost: string | null
  delivery_deadline: string | null
  total?: number
  items?: OrderItem[]
  status_history?: OrderStatusHistoryEntry[]
  created_at: string
  updated_at: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}
