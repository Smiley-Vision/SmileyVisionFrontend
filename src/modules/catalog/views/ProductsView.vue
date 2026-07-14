<script setup lang="ts">
import Paginator, { type PageState } from 'primevue/paginator'
import { computed } from 'vue'

import CatalogSidebar from '@/modules/catalog/components/CatalogSidebar.vue'
import ProductGrid from '@/modules/catalog/components/ProductGrid.vue'
import { useProductCatalog } from '@/modules/catalog/composables/useProductCatalog'
import Spinner from '@/modules/core/components/Spinner.vue'

const {
  categories,
  suppliers,
  products,
  pagination,
  isLoading,
  categorySlug,
  currentCategory,
  selectedSupplierId,
  searchQuery,
  selectCategory,
  selectSupplier,
  setPage,
} = useProductCatalog()

const title = computed(() => {
  if (searchQuery.value) return `Resultados para "${searchQuery.value}"`
  return currentCategory.value?.name ?? 'Todos los productos'
})

const first = computed(() => (pagination.value.current_page - 1) * pagination.value.per_page)

function onPageChange(event: PageState) {
  setPage(event.page + 1)
}
</script>

<template>
  <Spinner :is-loading text="Cargando productos..." />

  <div v-if="!isLoading" class="flex flex-col gap-8 px-6 py-10 lg:flex-row lg:px-12 lg:py-10">
    <CatalogSidebar
      :categories="categories"
      :current-category-slug="categorySlug"
      :suppliers="suppliers"
      :selected-supplier-id="selectedSupplierId"
      @select-category="selectCategory"
      @select-supplier="selectSupplier"
    />

    <div class="flex flex-1 flex-col gap-6">
      <div class="flex flex-col gap-1">
        <div class="text-3xl font-semibold text-sky-800 md:text-4xl">{{ title }}</div>
        <div class="text-sm font-medium text-slate-500">
          {{ pagination.total }} producto{{ pagination.total === 1 ? '' : 's' }}
        </div>
      </div>

      <ProductGrid :products="products" :is-loading="isLoading" />

      <Paginator
        v-if="!isLoading && pagination.last_page > 1"
        :rows="pagination.per_page"
        :total-records="pagination.total"
        :first="first"
        class="mt-4"
        @page="onPageChange"
      />
    </div>
  </div>
</template>
