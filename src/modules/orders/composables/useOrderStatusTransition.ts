import { ref } from 'vue'

import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import type { Order } from '@/modules/orders/interfaces/Order'
import {
  type UpdateOrderStatusPayload,
  updateOrderStatusService,
} from '@/modules/orders/services/orderService'

export function useOrderStatusTransition() {
  const notify = useAppToast()

  const isSubmitting = ref(false)

  async function transition(
    orderId: number,
    payload: UpdateOrderStatusPayload,
  ): Promise<Order | null> {
    isSubmitting.value = true

    try {
      const response = await updateOrderStatusService(orderId, payload)
      notify('success', 'Éxito', response.message)
      return response.data
    } catch (error) {
      notify('error', 'Error', firstProblemMessage(error as ApiProblemDetails))
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    transition,
  }
}
