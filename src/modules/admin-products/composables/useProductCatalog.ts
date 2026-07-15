import { ref } from 'vue'

import { getCategorySlug } from '@/modules/core/utils/productApiAdapters'

import type { ProductCategory } from '@/modules/admin-products/interfaces/ProductCategory'
import type { Supplier } from '@/modules/admin-products/interfaces/Supplier'
import type { Variation } from '@/modules/admin-products/interfaces/Variation'
import {
  getCategoriesService,
  getSuppliersByCategoryService,
  getVariationsByCategoryService,
} from '@/modules/admin-products/services/productCatalogService'

export type ProductCategorySlug = 'equipos' | 'armazones' | 'micas'

export function useProductCatalog() {
  const categories = ref<ProductCategory[]>([])
  const suppliers = ref<Supplier[]>([])
  const frameVariations = ref<Variation[]>([])

  const isLoadingCategories = ref(true)
  const isLoadingSuppliers = ref(false)
  const isLoadingVariations = ref(false)

  async function loadCategories() {
    isLoadingCategories.value = true

    try {
      const response = await getCategoriesService()
      categories.value = response.data
    } finally {
      isLoadingCategories.value = false
    }
  }

  function findCategoryBySlug(slug: ProductCategorySlug) {
    return categories.value.find((category) => getCategorySlug(category.name) === slug) ?? null
  }

  async function loadSuppliersForCategory(categoryId: number) {
    isLoadingSuppliers.value = true
    suppliers.value = []

    try {
      const response = await getSuppliersByCategoryService(categoryId)
      suppliers.value = response.data
    } finally {
      isLoadingSuppliers.value = false
    }
  }

  async function loadFrameVariations(categoryId: number) {
    isLoadingVariations.value = true
    frameVariations.value = []

    try {
      const response = await getVariationsByCategoryService(categoryId)
      frameVariations.value = response.data
    } finally {
      isLoadingVariations.value = false
    }
  }

  return {
    categories,
    suppliers,
    frameVariations,
    isLoadingCategories,
    isLoadingSuppliers,
    isLoadingVariations,
    loadCategories,
    findCategoryBySlug,
    loadSuppliersForCategory,
    loadFrameVariations,
  }
}
