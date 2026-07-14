<script setup lang="ts">
import Drawer from 'primevue/drawer'
import RadioButton from 'primevue/radiobutton'
import { ref } from 'vue'

import type { ProductCategory } from '@/modules/catalog/interfaces/ProductCategory'
import type { Supplier } from '@/modules/catalog/interfaces/Supplier'
import { slugify } from '@/modules/catalog/utils/slug'

defineProps<{
  categories: ProductCategory[]
  currentCategorySlug: string | null
  suppliers: Supplier[]
  selectedSupplierId: number | null
}>()

const emit = defineEmits<{
  'select-category': [slug: string | null]
  'select-supplier': [supplierId: number | null]
}>()

const isMobileOpen = ref(false)

function onSelectCategory(slug: string | null) {
  emit('select-category', slug)
  isMobileOpen.value = false
}

function onSelectSupplier(supplierId: number | null) {
  emit('select-supplier', supplierId)
  isMobileOpen.value = false
}
</script>

<template>
  <button
    type="button"
    class="mb-4 inline-flex items-center gap-2 self-start rounded-xl border-2 border-sky-600 px-4 py-2 font-semibold text-sky-800 lg:hidden"
    @click="isMobileOpen = true"
  >
    <i class="pi pi-filter"></i>
    Filtros
  </button>

  <aside class="hidden w-64 shrink-0 flex-col gap-8 lg:flex">
    <div class="flex flex-col gap-3">
      <div class="text-lg font-semibold text-sky-800">Categoría</div>
      <label class="flex cursor-pointer items-center gap-2 font-medium text-slate-600">
        <RadioButton
          :model-value="currentCategorySlug"
          :value="null"
          name="category"
          @update:model-value="onSelectCategory(null)"
        />
        Todas
      </label>
      <label
        v-for="category in categories"
        :key="category.id"
        class="flex cursor-pointer items-center gap-2 font-medium text-slate-600"
      >
        <RadioButton
          :model-value="currentCategorySlug"
          :value="slugify(category.name)"
          name="category"
          @update:model-value="onSelectCategory(slugify(category.name))"
        />
        {{ category.name }}
      </label>
    </div>

    <div v-if="suppliers.length > 0" class="flex flex-col gap-3">
      <div class="text-lg font-semibold text-sky-800">Proveedor</div>
      <label class="flex cursor-pointer items-center gap-2 font-medium text-slate-600">
        <RadioButton
          :model-value="selectedSupplierId"
          :value="null"
          name="supplier"
          @update:model-value="onSelectSupplier(null)"
        />
        Todos
      </label>
      <label
        v-for="supplier in suppliers"
        :key="supplier.id"
        class="flex cursor-pointer items-center gap-2 font-medium text-slate-600"
      >
        <RadioButton
          :model-value="selectedSupplierId"
          :value="supplier.id"
          name="supplier"
          @update:model-value="onSelectSupplier(supplier.id)"
        />
        {{ supplier.name }}
      </label>
    </div>
  </aside>

  <Drawer v-model:visible="isMobileOpen" header="Filtros" class="lg:hidden">
    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-3">
        <div class="text-lg font-semibold text-sky-800">Categoría</div>
        <label class="flex cursor-pointer items-center gap-2 font-medium text-slate-600">
          <RadioButton
            :model-value="currentCategorySlug"
            :value="null"
            name="category-mobile"
            @update:model-value="onSelectCategory(null)"
          />
          Todas
        </label>
        <label
          v-for="category in categories"
          :key="category.id"
          class="flex cursor-pointer items-center gap-2 font-medium text-slate-600"
        >
          <RadioButton
            :model-value="currentCategorySlug"
            :value="slugify(category.name)"
            name="category-mobile"
            @update:model-value="onSelectCategory(slugify(category.name))"
          />
          {{ category.name }}
        </label>
      </div>

      <div v-if="suppliers.length > 0" class="flex flex-col gap-3">
        <div class="text-lg font-semibold text-sky-800">Proveedor</div>
        <label class="flex cursor-pointer items-center gap-2 font-medium text-slate-600">
          <RadioButton
            :model-value="selectedSupplierId"
            :value="null"
            name="supplier-mobile"
            @update:model-value="onSelectSupplier(null)"
          />
          Todos
        </label>
        <label
          v-for="supplier in suppliers"
          :key="supplier.id"
          class="flex cursor-pointer items-center gap-2 font-medium text-slate-600"
        >
          <RadioButton
            :model-value="selectedSupplierId"
            :value="supplier.id"
            name="supplier-mobile"
            @update:model-value="onSelectSupplier(supplier.id)"
          />
          {{ supplier.name }}
        </label>
      </div>
    </div>
  </Drawer>
</template>
