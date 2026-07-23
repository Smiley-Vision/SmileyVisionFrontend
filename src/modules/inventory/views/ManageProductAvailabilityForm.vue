<script setup lang="ts">
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import Spinner from '@/modules/core/components/Spinner.vue'
import { formatLensValue } from '@/modules/core/utils/productApiAdapters'
import { useProductAvailabilityForm } from '@/modules/inventory/composables/useProductAvailabilityForm'

const backendUrl = import.meta.env.VITE_BACKEND_BASE

const route = useRoute()
const productId = Number(route.params.id)

const {
  isLoading,
  isSubmitting,
  hasError,
  product,
  productItems,
  branchOffices,
  hasProductItems,
  isLensProduct,
  lensSeries,
  selectedLensSeries,
  selectedProductItem,
  selectedProductItemId,
  selectedLensSeriesKey,
  lensSelectionMode,
  selectedLensItem,
  selectedLensItemValues,
  lensSphereOptions,
  lensCylinderOptions,
  selectedOfficeId,
  selectedOfficeName,
  totalStock,
  selectedItemTotalStock,
  productStock,
  initialStock,
  isStockModified,
  stockDelta,
  selectedItemImageSrc,
  getItemSubtitle,
  selectOffice,
  selectProductItem,
  selectLensSeries,
  setLensSelectionMode,
  selectLensItemBySphereCylinder,
  submitForm,
  loadData,
} = useProductAvailabilityForm(productId)

onMounted(async () => {
  await loadData()
})
</script>

<template>
  <Spinner :is-loading="isLoading" text="Cargando..." />

  <div v-if="!isLoading && hasError" class="flex flex-col items-center gap-y-3 py-24 text-center">
    <div class="flex size-20 items-center justify-center rounded-full bg-red-50 text-red-500">
      <i class="pi pi-exclamation-triangle" style="font-size: 2.5rem"></i>
    </div>
    <div class="text-2xl font-semibold text-sky-800">No se pudo cargar el producto</div>
  </div>

  <form
    v-else-if="!isLoading"
    @submit.prevent="submitForm"
    class="mx-auto mt-10 flex max-w-6xl flex-col gap-6 px-6 pb-12"
  >
    <div class="flex flex-col gap-2">
      <h2 class="text-3xl font-bold text-sky-800">Disponibilidad de {{ product?.name }}</h2>
      <p class="max-w-3xl text-sm font-medium text-slate-600">
        {{
          isLensProduct
            ? 'Selecciona una serie y una sucursal. Por defecto, el valor que captures se aplicará a todas las combinaciones de esa serie; también puedes elegir un ítem específico.'
            : 'Selecciona una variante y una sucursal. El valor que captures reemplaza el stock actual de esa variante en esa sucursal.'
        }}
      </p>
    </div>

    <div
      v-if="!hasProductItems"
      class="rounded-xl border border-amber-200 bg-amber-50 p-5 font-semibold text-amber-700"
    >
      Este producto no tiene variantes/SKU asociados.
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section
        class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-sky-800">
              {{ isLensProduct ? 'Series' : 'Variantes' }}
            </h3>
            <p class="text-sm font-medium text-slate-500">
              {{
                isLensProduct
                  ? `${lensSeries.length} series disponibles para administrar.`
                  : `${productItems.length} SKU disponibles para administrar.`
              }}
            </p>
          </div>
          <div class="rounded-lg bg-sky-50 px-4 py-2 text-right">
            <div class="text-xs font-semibold text-sky-600">Stock total</div>
            <div class="text-2xl font-bold text-sky-800">{{ totalStock }}</div>
          </div>
        </div>

        <div v-if="isLensProduct" class="grid gap-3 md:grid-cols-2">
          <button
            v-for="series in lensSeries"
            :key="series.key"
            type="button"
            @click="selectLensSeries(series.key)"
            :class="[
              selectedLensSeriesKey === series.key
                ? 'border-sky-600 bg-sky-50'
                : 'border-slate-200 bg-white hover:border-sky-300',
              'flex min-h-32 gap-3 rounded-xl border-2 p-3 text-left transition',
            ]"
          >
            <img
              :src="`${backendUrl}/storage/${series.image_url || product?.image_path}`"
              :alt="series.label"
              class="h-20 w-20 shrink-0 rounded-lg border border-slate-200 bg-white object-contain object-center"
            />
            <span class="flex min-w-0 flex-1 flex-col gap-1">
              <span class="font-bold text-sky-800">{{ series.label }}</span>
              <span class="text-sm font-medium text-slate-600"
                >${{ Number(series.price || 0).toFixed(2) }}</span
              >
              <span class="text-xs font-medium text-slate-600">
                Esfera {{ formatLensValue(series.sphereMin) }} a
                {{ formatLensValue(series.sphereMax) }}
              </span>
              <span class="text-xs font-medium text-slate-600">
                Cilindro {{ formatLensValue(series.cylinderMax) }} a
                {{ formatLensValue(series.cylinderMin) }}
              </span>
              <span class="text-sm font-semibold text-emerald-700"
                >Total: {{ series.totalStock }}</span
              >
            </span>
          </button>
        </div>

        <div v-else class="grid gap-3 md:grid-cols-2">
          <button
            v-for="item in productItems"
            :key="item.id"
            type="button"
            @click="selectProductItem(item.id)"
            :class="[
              selectedProductItemId === item.id
                ? 'border-sky-600 bg-sky-50'
                : 'border-slate-200 bg-white hover:border-sky-300',
              'flex min-h-28 gap-3 rounded-xl border-2 p-3 text-left transition',
            ]"
          >
            <img
              :src="`${backendUrl}/storage/${item.image_path || product?.image_path}`"
              alt="Variante"
              class="h-20 w-20 shrink-0 rounded-lg border border-slate-200 bg-white object-contain object-center"
            />
            <span class="flex min-w-0 flex-1 flex-col gap-1">
              <span class="font-bold text-sky-800">{{ item.SKU }}</span>
              <span class="text-sm font-medium text-slate-600">{{ getItemSubtitle(item) }}</span>
              <span class="text-sm font-semibold text-emerald-700">Total: {{ item.stock }}</span>
            </span>
          </button>
        </div>
      </section>

      <section
        class="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
      >
        <div class="flex gap-4">
          <img
            v-if="selectedItemImageSrc"
            :src="`${backendUrl}/storage/${selectedItemImageSrc}`"
            alt="Vista previa"
            class="h-28 w-28 rounded-xl border border-sky-200 bg-white object-contain object-center"
          />
          <div class="flex flex-col justify-center">
            <div class="text-sm font-semibold text-slate-500">
              {{ isLensProduct ? 'Serie seleccionada' : 'SKU seleccionado' }}
            </div>
            <div class="text-2xl font-bold text-sky-800">
              {{ isLensProduct ? selectedLensSeries?.label : selectedProductItem?.SKU }}
            </div>
            <div class="text-sm font-medium text-slate-600">
              {{
                isLensProduct
                  ? `$${Number(selectedLensSeries?.price || 0).toFixed(2)}`
                  : getItemSubtitle(selectedProductItem)
              }}
            </div>
            <div
              v-if="isLensProduct && lensSelectionMode === 'item'"
              class="text-xs font-medium text-slate-500"
            >
              SKU: {{ selectedLensItem?.SKU ?? '—' }}
            </div>
          </div>
        </div>

        <div v-if="isLensProduct && selectedLensSeries" class="flex flex-col gap-3">
          <div class="flex gap-2">
            <button
              type="button"
              @click="setLensSelectionMode('series')"
              :class="[
                lensSelectionMode === 'series'
                  ? 'bg-sky-600 text-white'
                  : 'border border-slate-300 text-slate-600 hover:border-sky-400',
                'rounded-lg px-3 py-1.5 text-sm font-semibold transition',
              ]"
            >
              Toda la serie
            </button>
            <button
              type="button"
              @click="setLensSelectionMode('item')"
              :class="[
                lensSelectionMode === 'item'
                  ? 'bg-sky-600 text-white'
                  : 'border border-slate-300 text-slate-600 hover:border-sky-400',
                'rounded-lg px-3 py-1.5 text-sm font-semibold transition',
              ]"
            >
              Ítem específico
            </button>
          </div>

          <div v-if="lensSelectionMode === 'item'" class="flex flex-wrap gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-500">Esfera</label>
              <Select
                :model-value="selectedLensItemValues?.sphere ?? null"
                :options="lensSphereOptions"
                option-label="label"
                option-value="value"
                class="w-28"
                @update:model-value="
                  (sphere) =>
                    selectLensItemBySphereCylinder(sphere, selectedLensItemValues?.cylinder ?? 0)
                "
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-500">Cilindro</label>
              <Select
                :model-value="selectedLensItemValues?.cylinder ?? null"
                :options="lensCylinderOptions"
                option-label="label"
                option-value="value"
                class="w-28"
                @update:model-value="
                  (cylinder) =>
                    selectLensItemBySphereCylinder(selectedLensItemValues?.sphere ?? 0, cylinder)
                "
              />
            </div>
          </div>
        </div>

        <div>
          <label for="office" class="mb-2 block font-semibold text-sky-800">Sucursal</label>
          <Select
            id="office"
            :model-value="selectedOfficeId"
            :options="branchOffices"
            option-label="name"
            option-value="id"
            fluid
            @update:model-value="selectOffice"
          />
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div class="text-sm font-semibold text-slate-500">
            Stock actual en {{ selectedOfficeName }}
          </div>
          <div class="mt-1 text-3xl font-bold text-sky-800">{{ initialStock }}</div>
          <div class="mt-1 text-sm font-medium text-slate-500">
            {{
              isLensProduct
                ? lensSelectionMode === 'item'
                  ? 'Stock de este ítem'
                  : 'Stock total de la serie'
                : 'Stock total de la variante'
            }}: {{ selectedItemTotalStock }}
          </div>
        </div>

        <div>
          <label for="stock" class="mb-2 block font-semibold text-sky-800">Nuevo stock</label>
          <InputNumber
            id="stock"
            v-model="productStock"
            show-buttons
            button-layout="horizontal"
            :min="0"
            :step="1"
            fluid
          >
            <template #incrementbuttonicon>
              <i class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
              <i class="pi pi-minus" />
            </template>
          </InputNumber>
        </div>

        <div
          :class="[
            stockDelta > 0
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : stockDelta < 0
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-slate-200 bg-slate-50 text-slate-600',
            'rounded-xl border p-4 text-sm font-semibold',
          ]"
        >
          {{
            stockDelta === 0
              ? 'Sin cambios pendientes.'
              : `Cambio pendiente: ${stockDelta > 0 ? '+' : ''}${stockDelta} unidades.`
          }}
        </div>

        <button
          type="submit"
          :disabled="isSubmitting || !isStockModified"
          :class="[
            isSubmitting || !isStockModified ? 'bg-slate-400' : 'bg-sky-600 hover:bg-sky-700',
            'rounded-xl px-8 py-3 font-semibold text-white transition',
          ]"
        >
          {{ isSubmitting ? 'Guardando...' : 'Guardar disponibilidad' }}
        </button>
      </section>
    </div>
  </form>
</template>
