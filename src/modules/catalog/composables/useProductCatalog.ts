import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { PaginationMeta } from '@/modules/catalog/interfaces/Pagination'
import type { Product } from '@/modules/catalog/interfaces/Product'
import type { ProductCategory } from '@/modules/catalog/interfaces/ProductCategory'
import type { Supplier } from '@/modules/catalog/interfaces/Supplier'
import {
  DEFAULT_PAGE_SIZE,
  getCategories,
  getCategorySuppliers,
  getProducts,
  getProductsByCategory,
} from '@/modules/catalog/services/catalogService'
import { slugify } from '@/modules/catalog/utils/slug'

function firstQueryValue(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '')
  return typeof value === 'string' ? value : ''
}

/**
 * Drives the general product catalog view: reads category (route param),
 * supplier/page/search (query params) from the URL, and keeps `products`
 * in sync. The URL is the source of truth so filters are shareable and
 * respect browser back/forward navigation.
 */
export function useProductCatalog() {
  const route = useRoute()
  const router = useRouter()

  const categories = ref<ProductCategory[]>([])
  const suppliers = ref<Supplier[]>([])
  const products = ref<Product[]>([])
  const pagination = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: DEFAULT_PAGE_SIZE,
    total: 0,
  })
  const isLoading = ref(true)
  const hasError = ref(false)

  const categorySlug = computed(() => {
    const raw = route.params.categorySlug
    const value = Array.isArray(raw) ? raw[0] : raw
    return value ? String(value) : null
  })

  const currentCategory = computed<ProductCategory | null>(() => {
    if (!categorySlug.value) return null
    return (
      categories.value.find((category) => slugify(category.name) === categorySlug.value) ?? null
    )
  })

  const selectedSupplierId = computed(() => {
    const parsed = Number(firstQueryValue(route.query.supplier))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  })

  const searchQuery = computed(() => firstQueryValue(route.query.search))

  const currentPage = computed(() => {
    const parsed = Number(firstQueryValue(route.query.page))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  })

  async function loadCategories() {
    try {
      categories.value = await getCategories()
    } catch {
      categories.value = []
    }
  }

  async function loadSuppliers() {
    if (!currentCategory.value) {
      suppliers.value = []
      return
    }

    try {
      suppliers.value = await getCategorySuppliers(currentCategory.value.id)
    } catch {
      suppliers.value = []
    }
  }

  async function loadProducts() {
    isLoading.value = true
    hasError.value = false

    try {
      const response = currentCategory.value
        ? await getProductsByCategory(currentCategory.value.id, {
            page: currentPage.value,
            query: searchQuery.value,
            supplierId: selectedSupplierId.value,
          })
        : await getProducts({
            page: currentPage.value,
            query: searchQuery.value,
          })

      products.value = response.data
      pagination.value = response.meta
    } catch {
      products.value = []
      hasError.value = true
    } finally {
      isLoading.value = false
    }
  }

  async function refresh() {
    await loadSuppliers()
    await loadProducts()
  }

  function selectCategory(slug: string | null) {
    router.push({
      name: 'shop',
      params: { categorySlug: slug ?? undefined },
      query: { search: searchQuery.value || undefined },
    })
  }

  function selectSupplier(supplierId: number | null) {
    router.push({
      name: 'shop',
      params: route.params,
      query: { ...route.query, supplier: supplierId ?? undefined, page: undefined },
    })
  }

  function setPage(page: number) {
    router.push({
      name: 'shop',
      params: route.params,
      query: { ...route.query, page: page > 1 ? page : undefined },
    })
  }

  onMounted(async () => {
    await loadCategories()
    await refresh()
  })

  watch(
    () => [route.params.categorySlug, route.query.supplier, route.query.page, route.query.search],
    () => {
      void refresh()
    },
  )

  return {
    categories,
    suppliers,
    products,
    pagination,
    isLoading,
    hasError,
    categorySlug,
    currentCategory,
    selectedSupplierId,
    searchQuery,
    currentPage,
    selectCategory,
    selectSupplier,
    setPage,
  }
}
