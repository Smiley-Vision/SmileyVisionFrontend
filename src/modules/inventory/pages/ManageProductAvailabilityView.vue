<script setup>
import api from '@/modules/core/api/smileyApi'
import {
  buildProductItemsByProductId,
  enrichProducts,
  normalizeCategoriesPayload,
  normalizeProductListPayload,
} from '@/modules/core/utils/productApiAdapters'
import { useToast } from 'primevue'
import { onMounted, ref } from 'vue'

const backendUrl = import.meta.env.VITE_BACKEND_BASE

const toast = useToast()

const searchQuery = ref('')
const productTypes = ref([])
const selectedType = ref(0)
const products = ref([])
const productItemsByProductId = ref({})

const isLoading = ref(false)
const isSearchQueryEmpty = ref(true)

const getProductRecencyValue = (product) => {
  const candidateDate = product?.created_at ?? product?.updated_at ?? null
  const timestamp = candidateDate ? new Date(candidateDate).getTime() : Number.NaN

  if (!Number.isNaN(timestamp)) return timestamp

  return Number(product?.id ?? 0)
}

const sortProductsByRecency = (items) => {
  return [...items].sort(
    (left, right) => getProductRecencyValue(right) - getProductRecencyValue(left),
  )
}

const loadRecentProducts = async () => {
  isLoading.value = true
  isSearchQueryEmpty.value = true

  const response =
    Number(selectedType.value) === 0
      ? (await api.get('products')).data
      : (
          await api.get('products/search', {
            params: {
              searchQuery: '',
              categoryID: selectedType.value,
            },
          })
        ).data
  const normalizedProducts = normalizeProductListPayload(response)

  products.value = sortProductsByRecency(
    enrichProducts(normalizedProducts, productItemsByProductId.value),
  ).slice(0, 10)

  isLoading.value = false
}

// Fetch products with the search query
const fetchFilteredProducts = async () => {
  try {
    if (searchQuery.value === '') {
      await loadRecentProducts()
      return
    }

    isLoading.value = true
    isSearchQueryEmpty.value = false
    const response = (
      await api.get('products/search', {
        params: {
          searchQuery: searchQuery.value,
          categoryID: selectedType.value,
        },
      })
    ).data

    isLoading.value = false
    products.value = enrichProducts(
      normalizeProductListPayload(response),
      productItemsByProductId.value,
    )
  } catch (error) {
    isLoading.value = false
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Prueba con otra búsqueda',
      life: 4000,
    })
  }
}

// Fetch the product types
onMounted(async () => {
  try {
    const [categoriesResponse, productItemsResponse] = await Promise.all([
      api.get('product-categories'),
      api.get('product-items'),
    ])

    productTypes.value = normalizeCategoriesPayload(categoriesResponse.data)
    productItemsByProductId.value = buildProductItemsByProductId(productItemsResponse.data)
    await loadRecentProducts()
  } catch (error) {
    isLoading.value = false
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron obtener los tipos de producto',
      life: 4000,
    })
  }
})
</script>

<template>
  <div
    class="flex flex-col lg:px-20 md:px-12 px-8 lg:mt-14 lg:py-0 md:py-10 py-8 lg:gap-y-10 gap-y-6"
  >
    <!-- Descriptive title -->
    <div class="text-3xl font-semibold text-sky-800">Busque un producto para disponibilidad</div>

    <!-- Search bar and type selector -->
    <div class="flex lg:flex-row flex-col lg:gap-x-12 lg:gap-y-0 gap-y-8">
      <input
        v-model="searchQuery"
        @input="fetchFilteredProducts"
        placeholder="Buscar por nombre o por código..."
        class="lg:w-2/3 w-full p-2 border border-2 border-solid border-slate-300 rounded-xl"
      />
      <select
        v-model="selectedType"
        @change="fetchFilteredProducts"
        name="type"
        id="type"
        :class="[
          'lg:w-1/3 w-full p-2 border border-2 border-solid border-slate-300 rounded-xl text-black',
        ]"
      >
        <option value="0">Todas las categorías</option>
        <option v-for="(type, index) in productTypes" :key="index" :value="type.id">
          {{ type.name }}
        </option>
      </select>
    </div>

    <!-- Loading screen -->
    <div v-if="isLoading" class="flex flex-col mx-auto my-auto items-center gap-y-8 mt-24">
      <div
        class="text-sky-600 pi pi-spinner-dotted animate-spin slow-spin"
        style="font-size: 8rem"
      ></div>
      <div class="lg:text-5xl text-4xl text-sky-700 font-bold">Cargando...</div>
    </div>

    <!-- Products grid -->
    <div
      v-else-if="products.length > 0"
      class="flex mx-auto items-center xl:grid xl:grid-cols-4 lg:grid lg:grid-cols-3 sm:grid sm:grid-cols-2 text-center flex-col gap-x-20 gap-y-12 pt-4"
    >
      <div
        v-for="product in products"
        :key="product.id"
        class="flex flex-col items-center gap-y-4 font-semibold text-xl text-sky-700"
      >
        <!-- Product name -->
        <div class="text-lg text-sky-700 font-semibold">
          {{ product.name }}
        </div>

        <!-- Product image -->
        <RouterLink
          :to="{ name: 'admin-products-availability-form', params: { code: product.id } }"
        >
          <img
            :src="`${backendUrl}/storage/${product.image_url}`"
            class="lg:size-60 size-40 object-contain object-center bg-white border-solid border-2 border-sky-600 rounded-xl shadow-lg hover:shadow-2xl transform transition duration-200 hover:scale-105"
          />
        </RouterLink>

        <!-- Product Code -->
        <div class="flex flex-row gap-x-4">
          <div class="font-semibold text-sky-500 text-lg">Código:</div>
          <div class="font-semibold text-sky-700 text-lg">
            {{ product.code }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="mx-auto max-w-2xl px-8 pb-12 text-center">
      <div class="text-2xl font-semibold text-sky-800">No se encontraron productos.</div>
      <div class="mt-2 text-sky-600">Intente con otro nombre, código o categoría.</div>
    </div>
  </div>

  <Toast position="bottom-right" />
</template>
