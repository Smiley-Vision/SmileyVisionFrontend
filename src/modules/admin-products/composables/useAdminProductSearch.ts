import { ref } from 'vue'

import { useProductCatalog } from '@/modules/admin-products/composables/useProductCatalog'
import type { Product } from '@/modules/admin-products/interfaces/Product'
import { getProductsByCategoryService } from '@/modules/admin-products/services/productCatalogService'
import { getAllProductsService } from '@/modules/admin-products/services/productSearchService'
import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'

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
      const response =
        selectedCategoryId.value !== ALL_CATEGORIES
          ? await getProductsByCategoryService(selectedCategoryId.value, query.value, page)
          : await getAllProductsService(page, query.value)

      products.value = response.data
      pagination.value = response.meta
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
