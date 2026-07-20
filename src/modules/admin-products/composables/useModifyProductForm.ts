import { ref } from 'vue'

import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'

import type { Product } from '@/modules/admin-products/interfaces/Product'
import type { UpdateProductFormValues } from '@/modules/admin-products/schemas/updateProductSchema'
import {
  deleteProductService,
  getProductService,
  updateProductService,
} from '@/modules/admin-products/services/productService'

export function useModifyProductForm(productId: number) {
  const notify = useAppToast()

  const product = ref<Product | null>(null)
  const isLoading = ref(true)
  const isSubmitting = ref(false)
  const isDeleting = ref(false)
  const hasError = ref(false)

  async function loadProduct() {
    isLoading.value = true
    hasError.value = false

    try {
      const response = await getProductService(productId)
      product.value = response.data
    } catch (error) {
      hasError.value = true
      notify(
        'error',
        'No se pudo obtener el producto',
        firstProblemMessage(error as ApiProblemDetails),
      )
    } finally {
      isLoading.value = false
    }
  }

  async function submitUpdate(values: UpdateProductFormValues) {
    isSubmitting.value = true

    try {
      const response = await updateProductService(productId, values)
      product.value = response.product
      notify('success', 'Éxito', 'Producto actualizado correctamente')
    } catch (error) {
      notify(
        'error',
        'No se pudo actualizar el producto',
        firstProblemMessage(error as ApiProblemDetails),
      )
    } finally {
      isSubmitting.value = false
    }
  }

  async function deleteProduct(): Promise<boolean> {
    isDeleting.value = true

    try {
      await deleteProductService(productId)
      notify('success', 'Eliminado', 'Producto eliminado correctamente')
      return true
    } catch (error) {
      notify(
        'error',
        'No se pudo eliminar el producto',
        firstProblemMessage(error as ApiProblemDetails),
      )
      return false
    } finally {
      isDeleting.value = false
    }
  }

  return {
    product,
    isLoading,
    isSubmitting,
    isDeleting,
    hasError,
    loadProduct,
    submitUpdate,
    deleteProduct,
  }
}
