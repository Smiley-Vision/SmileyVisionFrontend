<script setup lang="ts">
import Dialog from 'primevue/dialog'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Paginator, { type PageState } from 'primevue/paginator'
import Select from 'primevue/select'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ModifyProductFormContent from '@/modules/admin-products/components/ModifyProductFormContent.vue'
import { useAdminProductSearch } from '@/modules/admin-products/composables/useAdminProductSearch'
import Spinner from '@/modules/core/components/Spinner.vue'
import { InputText } from 'primevue'

const props = withDefaults(
  defineProps<{
    targetRouteName: string
    title: string
    openModalOnClick?: boolean
  }>(),
  {
    openModalOnClick: false,
  },
)

const backendUrl = import.meta.env.VITE_BACKEND_BASE

const route = useRoute()
const router = useRouter()

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

const selectedProductId = ref<number | null>(null)
const showEditModal = ref(false)

function onPageChange(event: PageState) {
  setPage(event.page + 1)
}

function openEditModal(productId: number) {
  selectedProductId.value = productId
  showEditModal.value = true
}

function handleProductDeleted() {
  showEditModal.value = false
  void setPage(pagination.value.current_page)
}

watch(showEditModal, (visible) => {
  if (visible) return

  selectedProductId.value = null

  if (route.query.edit) {
    const { edit: _edit, ...rest } = route.query
    void router.replace({ query: rest })
  }
})

onMounted(async () => {
  await init()

  if (props.openModalOnClick && typeof route.query.edit === 'string') {
    const editId = Number(route.query.edit)
    if (Number.isFinite(editId)) openEditModal(editId)
  }
})
</script>

<template>
  <div
    class="flex flex-col lg:px-32 px-6 lg:py-10 py-6 lg:gap-y-8 gap-y-6"
  >
    <div class="text-4xl font-semibold text-sky-800">{{ props.title }}</div>

    <div
      class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-md sm:flex-row sm:items-center"
    >
      <IconField class="w-full sm:w-2/3">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="query"
          placeholder="Buscar por nombre..."
          class="h-12 w-full text-base"
          fluid
          @input="onQueryChange"
        />
      </IconField>

      <div class="hidden h-10 w-px shrink-0 bg-slate-200 sm:block"></div>

      <Select
        v-model="selectedCategoryId"
        :options="categoryOptions"
        option-label="name"
        option-value="id"
        placeholder="Selecciona una categoría"
        class="h-12 w-full sm:w-1/3"
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
      <div class="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
        <div v-for="product in products" :key="product.id">
          <button
            v-if="openModalOnClick"
            type="button"
            class="group flex w-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            @click="openEditModal(product.id)"
          >
            <div class="flex aspect-square min-h-0 items-center justify-center overflow-hidden bg-white p-4">
              <img
                :src="`${backendUrl}/storage/${product.image_path}`"
                :alt="product.name"
                class="size-full object-contain object-center transition duration-200"
              />
            </div>
            <div class="border-t border-slate-100 px-4 py-3">
              <div class="line-clamp-1 font-semibold text-sky-800">{{ product.name }}</div>
            </div>
          </button>

          <RouterLink
            v-else
            :to="{ name: targetRouteName, params: { id: product.id } }"
            class="group flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="flex aspect-square min-h-0 items-center justify-center overflow-hidden bg-white p-4">
              <img
                :src="`${backendUrl}/storage/${product.image_path}`"
                :alt="product.name"
                class="size-full object-contain object-center transition duration-200"
              />
            </div>
            <div class="border-t border-slate-100 px-4 py-3">
              <div class="line-clamp-1 font-semibold text-sky-800">{{ product.name }}</div>
            </div>
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

  <Dialog v-model:visible="showEditModal" modal :draggable="false" :style="{ width: '36rem' }">
    <ModifyProductFormContent
      v-if="selectedProductId"
      :product-id="selectedProductId"
      @deleted="handleProductDeleted"
    />
  </Dialog>
</template>
