import { ref } from 'vue'

import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'

import type { Product } from '@/modules/admin-products/interfaces/Product'
import { useProductCatalog } from '@/modules/admin-products/composables/useProductCatalog'
import { getProductsByCategoryService } from '@/modules/admin-products/services/productCatalogService'
import { getAllProductsService } from '@/modules/admin-products/services/productSearchService'

interface PaginationState {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const ALL_CATEGORIES = 0
let debounceTimer: ReturnType<typeof setTimeout> | undefined

export function useAdminProductSearch() {
  const notify = useAppToast()
  const catalog = useProductCatalog()

  const query = ref('')
  const selectedCategoryId = ref(ALL_CATEGORIES)
  const products = ref<Product[]>([])
  const pagination = ref<PaginationState>({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  })
  const isLoading = ref(true)
  const hasError = ref(false)

  async function search(page = 1) {
    isLoading.value = true
    hasError.value = false

    try {
      if (selectedCategoryId.value !== ALL_CATEGORIES) {
        const response = await getProductsByCategoryService(
          selectedCategoryId.value,
          query.value,
        )
        products.value = response.data
        pagination.value = response.meta
        return
      }

      if (!query.value) {
        const response = await getAllProductsService(page)
        products.value = response.data
        pagination.value = response.meta
        return
      }

      // No existe un endpoint de búsqueda global: se consulta cada categoría
      // en paralelo y se mezclan los resultados.
      const responses = await Promise.all(
        catalog.categories.value.map((category) =>
          getProductsByCategoryService(category.id, query.value),
        ),
      )
      const merged = responses.flatMap((response) => response.data)
      merged.sort((left, right) => left.name.localeCompare(right.name, 'es'))

      products.value = merged
      pagination.value = {
        current_page: 1,
        last_page: 1,
        per_page: merged.length || 1,
        total: merged.length,
      }
    } catch (error) {
      products.value = []
      hasError.value = true
      notify(
        'error',
        'No se pudo completar la búsqueda',
        firstProblemMessage(error as ApiProblemDetails),
      )
    } finally {
      isLoading.value = false
    }
  }

  function setPage(page: number) {
    void search(page)
  }

  function onQueryChange() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => search(1), 300)
  }

  function onCategoryChange() {
    void search(1)
  }

  async function init() {
    await catalog.loadCategories()
    await search(1)
  }

  return {
    query,
    selectedCategoryId,
    categories: catalog.categories,
    products,
    pagination,
    isLoading,
    hasError,
    onQueryChange,
    onCategoryChange,
    setPage,
    init,
  }
}
