import { onMounted, ref } from 'vue'

import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import type { Order, PaginationMeta } from '@/modules/orders/interfaces/Order'
import { getOrdersService } from '@/modules/orders/services/orderService'

export function useMyOrders() {
  const notify = useAppToast()

  const orders = ref<Order[]>([])
  const pagination = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  })
  const isLoading = ref(true)

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

  onMounted(() => {
    void loadOrders()
  })

  return {
    orders,
    pagination,
    isLoading,
    setPage,
  }
}
