<script setup lang="ts">
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import FrameVariantSelectors from '@/modules/catalog/components/FrameVariantSelectors.vue'
import LensSeriesSelector from '@/modules/catalog/components/LensSeriesSelector.vue'
import { useProductDetail } from '@/modules/catalog/composables/useProductDetail'
import { formatPrice } from '@/modules/catalog/utils/formatPrice'
import { slugify } from '@/modules/catalog/utils/slug'
import Spinner from '@/modules/core/components/Spinner.vue'

const backendUrl = import.meta.env.VITE_BACKEND_BASE
const route = useRoute()
const productId = Number(route.params.code)

const {
  isLoading,
  isAddingToCart,
  product,
  currentCategory,
  isLensProduct,
  isFrameProduct,
  lensSeries,
  hasLensSeries,
  selectedLensSeriesQuantities,
  selectedLensSeriesTotalQuantity,
  selectedLensSeriesTotalPrice,
  frameVariantData,
  selectedFrameOptions,
  selectedItem,
  displayImage,
  displayPrice,
  purchaseAvailability,
  isAddToCartDisabled,
  selectFrameOption,
  isFrameOptionAvailable,
  setLensSeriesQuantity,
  getSelectedLensItem,
  getLensSphereOptions,
  getLensCylinderOptions,
  getSelectedLensSphere,
  getSelectedLensCylinder,
  selectLensItem,
  addToCart,
  editProduct,
  auth,
  cart,
} = useProductDetail(productId)

const categoryHref = computed(() =>
  currentCategory.value
    ? { name: 'shop', params: { categorySlug: slugify(currentCategory.value.name) } }
    : null,
)
</script>

<template>
  <Spinner :is-loading text="Cargando producto..." />

  <!-- Content -->
  <div
    v-if="!isLoading"
    class="mx-auto flex max-w-6xl flex-col gap-y-8 px-6 py-10 lg:px-16 lg:py-14"
  >
    <!-- Breadcrumb -->
    <nav class="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
      <RouterLink :to="{ name: 'shop' }" class="hover:text-sky-800">Tienda</RouterLink>
      <template v-if="categoryHref">
        <i class="pi pi-angle-right text-xs"></i>
        <RouterLink :to="categoryHref" class="hover:text-sky-800">{{
          currentCategory?.name
        }}</RouterLink>
      </template>
      <i class="pi pi-angle-right text-xs"></i>
      <span class="text-sky-800">{{ product?.name }}</span>
    </nav>

    <div class="flex flex-col gap-10 lg:flex-row">
      <!-- Product image -->
      <div class="flex justify-center lg:sticky lg:top-24 lg:h-fit">
        <img
          :src="`${backendUrl}/storage/${displayImage}`"
          alt="Imagen del producto"
          class="size-72 max-w-full rounded-md border-2 border-slate-100 bg-white object-contain object-center shadow-xl md:size-96 lg:size-[26rem]"
        />
      </div>

      <!-- Product details -->
      <div class="flex flex-1 flex-col gap-5">
        <div v-if="currentCategory" class="flex">
          <Tag :value="currentCategory.name" severity="info" />
        </div>

        <div class="text-3xl font-semibold text-sky-800">{{ product?.name }}</div>

        <div v-if="!isLensProduct && !isFrameProduct" class="font-bold text-3xl text-sky-800">
          <template v-if="displayPrice !== null">${{ formatPrice(displayPrice) }} MXN</template>
          <span v-else class="text-lg font-semibold text-slate-500">Precio no disponible</span>
        </div>

        <div v-if="!isLensProduct && !isFrameProduct && selectedItem" class="flex flex-row gap-x-2">
          <div class="font-semibold text-sky-800">Código:</div>
          <div class="font-semibold text-sky-800">{{ selectedItem.SKU }}</div>
        </div>

        <div v-if="!isFrameProduct" class="flex flex-col gap-2">
          <div class="text-lg font-semibold text-sky-800">Descripción</div>
          <div class="max-w-md text-justify font-medium text-slate-600">
            {{ product?.description }}
          </div>
        </div>

        <!-- Frame variant selectors -->
        <FrameVariantSelectors
          v-if="isFrameProduct"
          :frame-variant-data="frameVariantData"
          :selected-frame-options="selectedFrameOptions"
          :display-price="displayPrice"
          :is-frame-option-available="isFrameOptionAvailable"
          @select-option="selectFrameOption"
        />

        <!-- Lens series -->
        <LensSeriesSelector
          v-if="isLensProduct && hasLensSeries"
          :lens-series="lensSeries"
          :fallback-image-path="product?.image_path ?? ''"
          :selected-lens-series-quantities="selectedLensSeriesQuantities"
          :selected-lens-series-total-quantity="selectedLensSeriesTotalQuantity"
          :selected-lens-series-total-price="selectedLensSeriesTotalPrice"
          :get-selected-lens-item="getSelectedLensItem"
          :get-lens-sphere-options="getLensSphereOptions"
          :get-lens-cylinder-options="getLensCylinderOptions"
          :get-selected-lens-sphere="getSelectedLensSphere"
          :get-selected-lens-cylinder="getSelectedLensCylinder"
          @update-quantity="setLensSeriesQuantity"
          @select-lens-item="selectLensItem"
        />

        <!-- Availability -->
        <div
          :class="[
            purchaseAvailability.isAvailable
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700',
            'mt-2 rounded-xl border px-5 py-4 font-semibold',
          ]"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span>Disponibilidad</span>
            <span>{{ purchaseAvailability.label }}</span>
          </div>
          <div class="mt-1 text-sm font-medium">{{ purchaseAvailability.detail }}</div>
        </div>

        <Button
          v-if="cart.canUseCart || !auth.isAuthenticated"
          label="Agregar al carrito"
          icon="pi pi-shopping-cart"
          class="!bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800 mt-3"
          :loading="isAddingToCart"
          :disabled="isAddToCartDisabled"
          @click="addToCart"
        />
        <Button
          v-if="auth.isAdmin"
          label="Editar producto"
          icon="pi pi-pencil"
          class="!bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800 mt-3"
          @click="editProduct"
        />
      </div>
    </div>
  </div>

  <Toast position="bottom-right" />
</template>
