import { computed, reactive, ref } from 'vue'

import { useProductCatalog } from '@/modules/admin-products/composables/useProductCatalog'
import type { Product } from '@/modules/admin-products/interfaces/Product'
import type { ProductConfiguration } from '@/modules/admin-products/interfaces/ProductConfiguration'
import type { ProductItem } from '@/modules/admin-products/interfaces/ProductItem'
import {
  fetchAllProductItemsService,
  getProductConfigurationsService,
} from '@/modules/admin-products/services/productItemService'
import { getProductService } from '@/modules/admin-products/services/productService'
import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import {
  buildLensSeries,
  findLensItemBySphereCylinder,
  formatLensValue,
  getCategorySlug,
  getDistinctLensValues,
  parseLensSku,
} from '@/modules/core/utils/productApiAdapters'
import type { BranchOffice } from '@/modules/inventory/interfaces/BranchOffice'
import { getBranchOfficesService } from '@/modules/inventory/services/branchOfficeService'
import {
  getInventoryByOfficeService,
  updateInventoryBatchService,
} from '@/modules/inventory/services/inventoryService'

function normalizeVariationName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function useProductAvailabilityForm(productId: number) {
  const notify = useAppToast()
  const catalog = useProductCatalog()

  const isLoading = ref(true)
  const isSubmitting = ref(false)
  const hasError = ref(false)

  const product = ref<Product | null>(null)
  const productItems = ref<ProductItem[]>([])
  const productConfigurations = reactive<Record<number, ProductConfiguration[]>>({})
  const branchOffices = ref<BranchOffice[]>([])

  const selectedProductItemId = ref<number | null>(null)
  const selectedLensSeriesKey = ref<string | null>(null)
  const lensSelectionMode = ref<'series' | 'item'>('series')
  const selectedLensItemId = ref<number | null>(null)
  const selectedOfficeId = ref<number | null>(null)
  const inventoryByItemId = reactive<Record<number, number>>({})

  const productStock = ref(0)
  const initialStock = ref(0)

  const categorySlug = computed(() => {
    const category = catalog.categories.value.find(
      (candidate) => candidate.id === product.value?.category_id,
    )

    return category ? getCategorySlug(category.name) : ''
  })

  const hasProductItems = computed(() => productItems.value.length > 0)
  const isLensProduct = computed(() => categorySlug.value === 'micas')

  const lensSeries = computed(() =>
    buildLensSeries(productItems.value, product.value?.image_path ?? ''),
  )
  const selectedLensSeries = computed(
    () => lensSeries.value.find((series) => series.key === selectedLensSeriesKey.value) ?? null,
  )
  const selectedProductItem = computed(
    () => productItems.value.find((item) => item.id === selectedProductItemId.value) ?? null,
  )
  const selectedLensItem = computed(
    () =>
      selectedLensSeries.value?.items.find(
        (item: ProductItem) => item.id === selectedLensItemId.value,
      ) ?? null,
  )
  const lensSphereOptions = computed(() =>
    getDistinctLensValues(selectedLensSeries.value?.items ?? []).spheres.map((value) => ({
      label: formatLensValue(value),
      value,
    })),
  )
  const lensCylinderOptions = computed(() =>
    getDistinctLensValues(selectedLensSeries.value?.items ?? []).cylinders.map((value) => ({
      label: formatLensValue(value),
      value,
    })),
  )
  const selectedLensItemValues = computed(() => parseLensSku(selectedLensItem.value?.SKU))

  const selectedOfficeName = computed(
    () => branchOffices.value.find((office) => office.id === selectedOfficeId.value)?.name ?? '',
  )

  const totalStock = computed(() => {
    if (isLensProduct.value) {
      return lensSeries.value.reduce((total, series) => total + series.totalStock, 0)
    }

    return productItems.value.reduce((total, item) => total + item.stock, 0)
  })

  const selectedItemTotalStock = computed(() => {
    if (isLensProduct.value) {
      return lensSelectionMode.value === 'item'
        ? (selectedLensItem.value?.stock ?? 0)
        : (selectedLensSeries.value?.totalStock ?? 0)
    }

    return selectedProductItem.value?.stock ?? 0
  })

  const isStockModified = computed(() => productStock.value !== initialStock.value)
  const stockDelta = computed(() => productStock.value - initialStock.value)

  const selectedItemImageSrc = computed(() => {
    if (isLensProduct.value) {
      return selectedLensSeries.value?.image_url || product.value?.image_path || ''
    }

    return selectedProductItem.value?.image_path ?? product.value?.image_path ?? ''
  })

  function getItemSubtitle(item: ProductItem | null): string {
    if (!item) return ''

    if (categorySlug.value === 'armazones') {
      const configurations = [...(productConfigurations[item.id] ?? [])].sort((left, right) => {
        const order: Record<string, number> = { color: 1, material: 2 }

        return (
          (order[normalizeVariationName(left.variation)] ?? 99) -
          (order[normalizeVariationName(right.variation)] ?? 99)
        )
      })

      return configurations.length > 0
        ? configurations.map((entry) => `${entry.variation}: ${entry.value}`).join(' | ')
        : 'Variante sin atributos'
    }

    return 'Producto base'
  }

  function refreshStockFromSelection() {
    const itemId = isLensProduct.value
      ? lensSelectionMode.value === 'item'
        ? selectedLensItemId.value
        : selectedLensSeries.value?.representativeItem?.id
      : selectedProductItem.value?.id
    const currentStock = itemId != null ? (inventoryByItemId[itemId] ?? 0) : 0

    productStock.value = currentStock
    initialStock.value = currentStock
  }

  async function selectOffice(officeId: number) {
    selectedOfficeId.value = officeId

    try {
      const response = await getInventoryByOfficeService(officeId)

      Object.keys(inventoryByItemId).forEach((key) => delete inventoryByItemId[Number(key)])
      response.data.forEach((entry) => {
        inventoryByItemId[entry.item_id] = entry.stock
      })
    } catch (error) {
      notify(
        'error',
        'No se pudo obtener el inventario',
        firstProblemMessage(error as ApiProblemDetails),
      )
    }

    refreshStockFromSelection()
  }

  function selectProductItem(itemId: number) {
    selectedProductItemId.value = itemId
    refreshStockFromSelection()
  }

  function selectLensSeries(seriesKey: string) {
    selectedLensSeriesKey.value = seriesKey
    selectedLensItemId.value = selectedLensSeries.value?.representativeItem?.id ?? null
    refreshStockFromSelection()
  }

  function setLensSelectionMode(mode: 'series' | 'item') {
    lensSelectionMode.value = mode

    if (mode === 'item' && selectedLensItemId.value == null) {
      selectedLensItemId.value = selectedLensSeries.value?.representativeItem?.id ?? null
    }

    refreshStockFromSelection()
  }

  function selectLensItemBySphereCylinder(sphere: number, cylinder: number) {
    const item = findLensItemBySphereCylinder(selectedLensSeries.value?.items ?? [], sphere, cylinder)
    if (!item) return

    selectedLensItemId.value = item.id
    refreshStockFromSelection()
  }

  async function submitForm() {
    if (
      selectedOfficeId.value === null ||
      (!isLensProduct.value && selectedProductItemId.value === null) ||
      (isLensProduct.value && !selectedLensSeries.value) ||
      (isLensProduct.value && lensSelectionMode.value === 'item' && !selectedLensItem.value)
    ) {
      notify('warn', 'Datos incompletos', 'Selecciona una variante/serie y una sucursal.')
      return
    }

    isSubmitting.value = true

    const targetItems: ProductItem[] = isLensProduct.value
      ? lensSelectionMode.value === 'item'
        ? [selectedLensItem.value].filter((item): item is ProductItem => item !== null)
        : ((selectedLensSeries.value?.items ?? []) as ProductItem[])
      : [selectedProductItem.value].filter((item): item is ProductItem => item !== null)
    const officeId = selectedOfficeId.value
    const delta = stockDelta.value

    try {
      await updateInventoryBatchService(
        targetItems.map((item) => item.id),
        officeId,
        productStock.value,
      )

      for (const item of targetItems) {
        inventoryByItemId[item.id] = productStock.value
        item.stock += delta
      }

      initialStock.value = productStock.value

      notify(
        'success',
        'Disponibilidad actualizada',
        isLensProduct.value
          ? 'El stock de la serie se actualizó correctamente.'
          : 'El stock de la variante se actualizó correctamente.',
      )
    } catch (error) {
      notify(
        'error',
        'No se pudo actualizar el inventario',
        firstProblemMessage(error as ApiProblemDetails),
      )
    } finally {
      isSubmitting.value = false
    }
  }

  async function loadFrameConfigurations() {
    if (categorySlug.value !== 'armazones') return

    const results = await Promise.all(
      productItems.value.map((item) => getProductConfigurationsService(item.id)),
    )

    productItems.value.forEach((item, index) => {
      productConfigurations[item.id] = results[index].data
    })
  }

  async function loadData() {
    isLoading.value = true
    hasError.value = false

    try {
      await catalog.loadCategories()

      const [productResponse, items, officesResponse] = await Promise.all([
        getProductService(productId),
        fetchAllProductItemsService(productId),
        getBranchOfficesService(),
      ])

      product.value = productResponse.data
      productItems.value = items
      branchOffices.value = officesResponse.data

      await loadFrameConfigurations()

      selectedProductItemId.value = productItems.value[0]?.id ?? null
      selectedLensSeriesKey.value = lensSeries.value[0]?.key ?? null
      selectedLensItemId.value = lensSeries.value[0]?.representativeItem?.id ?? null

      const defaultOffice = branchOffices.value[0]?.id

      if (defaultOffice != null) {
        await selectOffice(defaultOffice)
      }

      if (!hasProductItems.value) {
        notify(
          'warn',
          'Atención',
          'Este producto no tiene variantes/SKU asociados. No se puede editar inventario.',
        )
      }
    } catch (error) {
      hasError.value = true
      notify(
        'error',
        'No se pudo obtener información del producto',
        firstProblemMessage(error as ApiProblemDetails),
      )
    } finally {
      isLoading.value = false
    }
  }

  return {
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
    selectedLensItemId,
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
  }
}
