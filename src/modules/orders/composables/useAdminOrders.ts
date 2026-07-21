import { onMounted, ref } from 'vue'

import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import type { Order, PaginationMeta } from '@/modules/orders/interfaces/Order'
import { getOrdersService } from '@/modules/orders/services/orderService'

export function useAdminOrders() {
  const notify = useAppToast()

  const orders = ref<Order[]>([])
  const pagination = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  })
  const isLoading = ref(true)

  const statusFilter = ref<string | null>(null)
  const monthFilter = ref<number | null>(null)
  const yearFilter = ref<number | null>(null)

  async function loadOrders(page = 1) {
    isLoading.value = true

    try {
      const response = await getOrdersService(page, {
        status: statusFilter.value ?? undefined,
        month: monthFilter.value ?? undefined,
        year: yearFilter.value ?? undefined,
      })
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

  function applyFilters() {
    void loadOrders(1)
  }

  onMounted(() => {
    void loadOrders()
  })

  return {
    orders,
    pagination,
    isLoading,
    statusFilter,
    monthFilter,
    yearFilter,
    setPage,
    applyFilters,
    loadOrders,
  }
}
