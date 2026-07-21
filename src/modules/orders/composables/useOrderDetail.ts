import { onMounted, ref } from 'vue'

import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import type { Order } from '@/modules/orders/interfaces/Order'
import { getOrderService } from '@/modules/orders/services/orderService'

export function useOrderDetail(orderId: number) {
  const notify = useAppToast()

  const order = ref<Order | null>(null)
  const isLoading = ref(true)
  const hasError = ref(false)

  async function loadOrder() {
    isLoading.value = true
    hasError.value = false

    try {
      const response = await getOrderService(orderId)
      order.value = response.data
    } catch (error) {
      hasError.value = true
      notify('error', 'Error', firstProblemMessage(error as ApiProblemDetails))
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    void loadOrder()
  })

  return {
    order,
    isLoading,
    hasError,
    reload: loadOrder,
  }
}
