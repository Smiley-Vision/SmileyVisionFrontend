import { computed, reactive, ref } from 'vue'

import { useProductCatalog } from '@/modules/admin-products/composables/useProductCatalog'
import type { Product } from '@/modules/admin-products/interfaces/Product'
import type { ProductConfiguration } from '@/modules/admin-products/interfaces/ProductConfiguration'
import type { ProductItem } from '@/modules/admin-products/interfaces/ProductItem'
import {
  fetchAllProductItemsService,
  getProductConfigurationsService,
  updateItemImageService,
  updateItemPriceService,
} from '@/modules/admin-products/services/productItemService'
import { getProductService } from '@/modules/admin-products/services/productService'
import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import { buildLensSeries, getCategorySlug } from '@/modules/core/utils/productApiAdapters'

function normalizeVariationName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function useModifyProductItemForm(productId: number) {
  const notify = useAppToast()
  const catalog = useProductCatalog()

  const isLoading = ref(true)
  const isSubmitting = ref(false)
  const hasError = ref(false)

  const product = ref<Product | null>(null)
  const productItems = ref<ProductItem[]>([])
  const productConfigurations = reactive<Record<number, ProductConfiguration[]>>({})

  const selectedProductItemId = ref<number | null>(null)
  const selectedLensSeriesKey = ref<string | null>(null)

  const itemPrice = ref(0)
  const initialPrice = ref(0)
  const selectedImageFile = ref<File | null>(null)
  const selectedImagePreviewUrl = ref<string | null>(null)

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

  const isPriceModified = computed(() => itemPrice.value !== initialPrice.value)
  const isImageModified = computed(() => selectedImageFile.value !== null)
  const isFormModified = computed(() => isPriceModified.value || isImageModified.value)

  const currentImageSrc = computed(() => {
    if (selectedImagePreviewUrl.value) return selectedImagePreviewUrl.value

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

  function refreshFieldsFromSelection() {
    const price = Number(
      (isLensProduct.value
        ? selectedLensSeries.value?.price
        : selectedProductItem.value?.price) ?? 0,
    )

    itemPrice.value = price
    initialPrice.value = price
    selectedImageFile.value = null
    selectedImagePreviewUrl.value = null
  }

  function selectProductItem(itemId: number) {
    selectedProductItemId.value = itemId
    refreshFieldsFromSelection()
  }

  function selectLensSeries(seriesKey: string) {
    selectedLensSeriesKey.value = seriesKey
    refreshFieldsFromSelection()
  }

  function onImageSelected(file: File) {
    selectedImageFile.value = file
    selectedImagePreviewUrl.value = URL.createObjectURL(file)
  }

  async function submitForm() {
    if (
      (!isLensProduct.value && selectedProductItemId.value === null) ||
      (isLensProduct.value && !selectedLensSeries.value)
    ) {
      notify('warn', 'Datos incompletos', 'Selecciona una variante/serie.')
      return
    }

    isSubmitting.value = true

    const targetItems = isLensProduct.value
      ? (selectedLensSeries.value?.items ?? [])
      : [selectedProductItem.value].filter((item): item is ProductItem => item !== null)

    try {
      if (isPriceModified.value) {
        for (const item of targetItems) {
          await updateItemPriceService(item.id, itemPrice.value)
          item.price = itemPrice.value
        }
      }

      if (isImageModified.value && selectedImageFile.value) {
        for (const item of targetItems) {
          const formData = new FormData()
          formData.append('image', selectedImageFile.value)

          const response = await updateItemImageService(item.id, formData)
          item.image_path = response.data.image_path
        }
      }

      initialPrice.value = itemPrice.value
      selectedImageFile.value = null
      selectedImagePreviewUrl.value = null

      notify(
        'success',
        'Ítem actualizado',
        isLensProduct.value
          ? 'La serie se actualizó correctamente.'
          : 'La variante se actualizó correctamente.',
      )
    } catch (error) {
      notify(
        'error',
        'No se pudo actualizar el ítem',
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

      const [productResponse, items] = await Promise.all([
        getProductService(productId),
        fetchAllProductItemsService(productId),
      ])

      product.value = productResponse.data
      productItems.value = items

      await loadFrameConfigurations()

      selectedProductItemId.value = productItems.value[0]?.id ?? null
      selectedLensSeriesKey.value = lensSeries.value[0]?.key ?? null

      refreshFieldsFromSelection()

      if (!hasProductItems.value) {
        notify(
          'warn',
          'Atención',
          'Este producto no tiene variantes/SKU asociados. No se puede editar ítems.',
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
    hasProductItems,
    isLensProduct,
    lensSeries,
    selectedLensSeries,
    selectedProductItem,
    selectedProductItemId,
    selectedLensSeriesKey,
    itemPrice,
    isFormModified,
    currentImageSrc,
    getItemSubtitle,
    selectProductItem,
    selectLensSeries,
    onImageSelected,
    submitForm,
    loadData,
  }
}
