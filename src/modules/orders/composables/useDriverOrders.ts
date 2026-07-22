import { onMounted, ref } from 'vue'

import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import type { Order, OrderStatusName, PaginationMeta } from '@/modules/orders/interfaces/Order'
import { getOrdersService, updateOrderStatusService } from '@/modules/orders/services/orderService'

const NEXT_STATUS: Partial<Record<OrderStatusName, OrderStatusName>> = {
  pendiente: 'procesando',
  procesando: 'enviado',
  enviado: 'completado',
}

const NEXT_STATUS_LABEL: Partial<Record<OrderStatusName, string>> = {
  pendiente: 'Marcar como procesando',
  procesando: 'Marcar como enviado',
  enviado: 'Marcar como completado',
}

export function useDriverOrders() {
  const notify = useAppToast()

  const orders = ref<Order[]>([])
  const pagination = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  })
  const isLoading = ref(true)
  const processingIds = ref(new Set<number>())

  function isProcessing(id: number) {
    return processingIds.value.has(id)
  }

  function nextStatusFor(order: Order) {
    return NEXT_STATUS[order.current_status] ?? null
  }

  function nextStatusLabel(order: Order) {
    return NEXT_STATUS_LABEL[order.current_status] ?? null
  }

  async function loadOrders(page = 1) {
    isLoading.value = true

    try {
      const response = await getOrdersService(page)
      orders.value = response.data
      pagination.value = response.meta
    } catch (error) {
      orders.value = []
      notify('error', 'Error', firstProblemMessage(error as ApiProblemDetails))
    } finally {
      isLoading.value = false
    }
  }

  function setPage(page: number) {
    void loadOrders(page)
  }

  async function refreshAfterRemoval() {
    const isLastItemOnPage = orders.value.length === 1
    const hasPreviousPage = pagination.value.current_page > 1
    const targetPage =
      isLastItemOnPage && hasPreviousPage
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await loadOrders(targetPage)
  }

  async function advanceOrder(order: Order) {
    const target = nextStatusFor(order)
    if (!target || isProcessing(order.id)) return

    processingIds.value = new Set(processingIds.value).add(order.id)

    try {
      const response = await updateOrderStatusService(order.id, { status: target })
      notify('success', 'Éxito', response.message)
      await refreshAfterRemoval()
    } catch (error) {
      notify('error', 'Error', firstProblemMessage(error as ApiProblemDetails))
    } finally {
      const next = new Set(processingIds.value)
      next.delete(order.id)
      processingIds.value = next
    }
  }

  onMounted(() => {
    void loadOrders()
  })

  return {
    orders,
    pagination,
    isLoading,
    isProcessing,
    nextStatusFor,
    nextStatusLabel,
    setPage,
    advanceOrder,
  }
}
