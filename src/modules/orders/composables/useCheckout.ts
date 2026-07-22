import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import { useCartStore } from '@/modules/user/stores/cart'

import { createOrderService } from '../services/orderService'

export function useCheckout() {
  const notify = useAppToast()
  const router = useRouter()
  const cart = useCartStore()

  const isSubmitting = ref(false)
  const stockIssues = ref<string[]>([])

  async function submit() {
    if (isSubmitting.value) return

    isSubmitting.value = true
    stockIssues.value = []

    try {
      const response = await createOrderService()
      cart.clearLocalCart()
      notify('success', 'Pedido creado', response.message)
      await router.push({ name: 'order-confirmation', params: { id: response.data.id } })
    } catch (error) {
      const problem = error as ApiProblemDetails

      if (problem.errors?.cart) {
        stockIssues.value = problem.errors.cart
      }

      notify('error', 'No se pudo crear el pedido', firstProblemMessage(problem))
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    stockIssues,
    submit,
  }
}
