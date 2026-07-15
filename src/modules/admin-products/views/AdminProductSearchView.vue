<script setup lang="ts">
import Paginator, { type PageState } from 'primevue/paginator'
import Select from 'primevue/select'
import { computed, onMounted } from 'vue'

import Spinner from '@/modules/core/components/Spinner.vue'

import { useAdminProductSearch } from '@/modules/admin-products/composables/useAdminProductSearch'

const props = defineProps<{
  targetRouteName: string
  title: string
}>()

const backendUrl = import.meta.env.VITE_BACKEND_BASE

const {
  query,
  selectedCategoryId,
  categories,
  products,
  pagination,
  isLoading,
  hasError,
  onQueryChange,
  onCategoryChange,
  setPage,
  init,
} = useAdminProductSearch()

const categoryOptions = computed(() => [
  { id: 0, name: 'Todas las categorías' },
  ...categories.value,
])

const first = computed(() => (pagination.value.current_page - 1) * pagination.value.per_page)

function onPageChange(event: PageState) {
  setPage(event.page + 1)
}

onMounted(() => {
  void init()
})
</script>

<template>
  <div
    class="flex flex-col lg:px-20 md:px-12 px-8 lg:mt-14 lg:py-0 md:py-10 py-8 lg:gap-y-10 gap-y-6"
  >
    <div class="text-3xl font-semibold text-sky-800">{{ props.title }}</div>

    <div class="flex lg:flex-row flex-col lg:gap-x-12 lg:gap-y-0 gap-y-8">
      <input
        v-model="query"
        placeholder="Buscar por nombre..."
        class="lg:w-2/3 w-full p-2 border border-2 border-solid border-slate-300 rounded-xl"
        @input="onQueryChange"
      />
      <Select
        v-model="selectedCategoryId"
        :options="categoryOptions"
        option-label="name"
        option-value="id"
        class="lg:w-1/3 w-full"
        @update:model-value="onCategoryChange"
      />
    </div>

    <Spinner :is-loading="isLoading" text="Buscando productos..." />

    <div v-if="!isLoading && hasError" class="flex flex-col items-center gap-y-3 py-24 text-center">
      <div class="flex size-20 items-center justify-center rounded-full bg-red-50 text-red-500">
        <i class="pi pi-exclamation-triangle" style="font-size: 2.5rem"></i>
      </div>
      <div class="text-2xl font-semibold text-sky-800">No se pudo completar la búsqueda</div>
    </div>

    <div
      v-else-if="!isLoading && products.length === 0"
      class="flex flex-col items-center gap-y-3 py-24 text-center"
    >
      <div class="flex size-20 items-center justify-center rounded-full bg-sky-50 text-sky-500">
        <i class="pi pi-inbox" style="font-size: 2.5rem"></i>
      </div>
      <div class="text-2xl font-semibold text-sky-800">No se encontraron productos</div>
      <div class="text-slate-500">Intenta con otro nombre o categoría.</div>
    </div>

    <template v-else-if="!isLoading">
      <div
        class="flex mx-auto items-center xl:grid xl:grid-cols-4 lg:grid lg:grid-cols-3 sm:grid sm:grid-cols-2 text-center flex-col gap-x-20 gap-y-12 pt-4"
      >
        <div
          v-for="product in products"
          :key="product.id"
          class="flex flex-col items-center gap-y-4 font-semibold text-xl text-sky-700"
        >
          <div class="text-lg text-sky-700 font-semibold">{{ product.name }}</div>
          <RouterLink :to="{ name: targetRouteName, params: { id: product.id } }">
            <img
              :src="`${backendUrl}/storage/${product.image_path}`"
              class="lg:size-60 size-40 object-contain object-center bg-white border-solid border-2 border-sky-600 rounded-xl shadow-lg hover:shadow-2xl transform transition duration-200 hover:scale-105"
            />
          </RouterLink>
        </div>
      </div>

      <Paginator
        v-if="pagination.last_page > 1"
        :rows="pagination.per_page"
        :total-records="pagination.total"
        :first="first"
        @page="onPageChange"
      />
    </template>
  </div>

  <Toast position="bottom-right" />
</template>
