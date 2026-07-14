<script setup lang="ts">
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useProductDetail } from '@/modules/catalog/composables/useProductDetail'
import { formatLensValue } from '@/modules/catalog/utils/lensSeries'
import { slugify } from '@/modules/catalog/utils/slug'

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
  addToCart,
  editProduct,
  auth,
  cart,
} = useProductDetail(productId)

const formatPrice = (price: number | string | null | undefined) => {
  const numericPrice = Number(price ?? 0)
  if (!Number.isFinite(numericPrice)) return '0.00'
  return numericPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const categoryHref = computed(() =>
  currentCategory.value ? { name: 'shop', params: { categorySlug: slugify(currentCategory.value.name) } } : null,
)
</script>

<template>
  <!-- Loading screen -->
  <div v-if="isLoading" class="mx-auto my-auto flex flex-col items-center gap-y-8 mt-24">
    <div
      class="pi pi-spinner-dotted slow-spin animate-spin text-sky-800"
      style="font-size: 8rem"
    ></div>
    <div class="text-4xl font-bold text-sky-800 lg:text-5xl">Cargando...</div>
  </div>

  <!-- Content -->
  <div v-else class="mx-auto flex max-w-6xl flex-col gap-y-8 px-6 py-10 lg:px-16 lg:py-14">
    <!-- Breadcrumb -->
    <nav class="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
      <RouterLink :to="{ name: 'shop' }" class="hover:text-sky-800">Tienda</RouterLink>
      <template v-if="categoryHref">
        <i class="pi pi-angle-right text-xs"></i>
        <RouterLink :to="categoryHref" class="hover:text-sky-800">{{ currentCategory?.name }}</RouterLink>
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
          class="size-72 max-w-full rounded-lg border-2 border-sky-600 bg-white object-contain object-center shadow-xl md:size-96 lg:size-[26rem]"
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
          <div class="max-w-md text-justify font-medium text-slate-600">{{ product?.description }}</div>
        </div>

        <!-- Frame variant selectors -->
        <div v-if="isFrameProduct" class="flex flex-col gap-6">
          <div v-for="variation in frameVariantData.variations" :key="variation.name" class="flex flex-col gap-3">
            <div class="font-semibold text-sky-800">{{ variation.name }}:</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in variation.options"
                :key="option"
                type="button"
                :disabled="!isFrameOptionAvailable(variation.name, option)"
                :class="[
                  selectedFrameOptions[variation.name] === option
                    ? 'border-sky-700 bg-sky-700 text-white'
                    : isFrameOptionAvailable(variation.name, option)
                      ? 'border-slate-300 text-slate-600 hover:border-sky-500'
                      : 'cursor-not-allowed border-slate-200 text-slate-300',
                  'rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition',
                ]"
                @click="selectFrameOption(variation.name, option)"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <div class="font-bold text-3xl text-sky-800">${{ formatPrice(displayPrice) }} MXN</div>
        </div>

        <!-- Lens series -->
        <div
          v-if="isLensProduct && hasLensSeries"
          class="mt-2 flex flex-col gap-5 rounded-xl border border-sky-100 bg-sky-50/80 p-5"
        >
          <div class="flex flex-col gap-1">
            <div class="text-lg font-semibold text-sky-800">Series disponibles</div>
            <div class="text-sm text-slate-600">Selecciona las series que quieres agregar a tu pedido.</div>
          </div>

          <div class="grid gap-3">
            <div v-for="series in lensSeries" :key="series.key" class="rounded-xl border border-sky-100 bg-white p-4">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
                <img
                  :src="`${backendUrl}/storage/${series.image_path || product?.image_path}`"
                  :alt="series.label"
                  class="h-24 w-24 shrink-0 rounded-lg border border-slate-200 bg-white object-contain object-center"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div class="font-bold text-sky-800">{{ series.label }}</div>
                      <div class="text-sm font-medium text-slate-600">{{ series.items.length }} combinaciones</div>
                    </div>
                    <div class="text-xl font-bold text-sky-800">${{ formatPrice(series.price) }}</div>
                  </div>
                  <div class="mt-2 text-sm font-medium text-slate-600">
                    Esfera {{ formatLensValue(series.sphereMin) }} a {{ formatLensValue(series.sphereMax) }}
                  </div>
                  <div class="text-sm font-medium text-slate-600">
                    Cilindro {{ formatLensValue(series.cylinderMax) }} a {{ formatLensValue(series.cylinderMin) }}
                  </div>
                  <Tag
                    :severity="series.totalStock > 0 ? 'success' : 'danger'"
                    :value="`Stock total: ${series.totalStock}`"
                    class="mt-1"
                  />
                </div>
                <InputNumber
                  :model-value="selectedLensSeriesQuantities[series.key] ?? 0"
                  show-buttons
                  button-layout="horizontal"
                  :min="0"
                  class="w-full sm:w-36"
                  input-class="text-center"
                  @update:model-value="(value) => setLensSeriesQuantity(series.key, value ?? 0)"
                >
                  <template #incrementicon><i class="pi pi-plus"></i></template>
                  <template #decrementicon><i class="pi pi-minus"></i></template>
                </InputNumber>
              </div>
            </div>
          </div>

          <div class="rounded-xl border-2 border-slate-500 bg-white px-5 py-4">
            <div class="flex items-center justify-between gap-4 text-lg text-slate-600">
              <span>Series seleccionadas:</span>
              <span class="font-semibold">{{ selectedLensSeriesTotalQuantity }}</span>
            </div>
            <div class="mt-2 flex items-center justify-between gap-4 text-xl text-slate-600">
              <span>Total estimado:</span>
              <span class="font-bold text-3xl text-sky-800">${{ formatPrice(selectedLensSeriesTotalPrice) }}</span>
            </div>
          </div>
        </div>

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
