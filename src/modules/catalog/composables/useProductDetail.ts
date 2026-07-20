import { useToast } from 'primevue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { ProductConfiguration } from '@/modules/catalog/interfaces/ProductConfiguration'
import type { Product } from '@/modules/catalog/interfaces/Product'
import type { ProductCategory } from '@/modules/catalog/interfaces/ProductCategory'
import type { ProductItem } from '@/modules/catalog/interfaces/ProductItem'
import {
  getCategories,
  getProductById,
  getProductConfigurationsByItem,
  getProductItemsByProductId,
} from '@/modules/catalog/services/catalogService'
import {
  buildFrameVariantData,
  findMatchingFrameItem,
  isFrameOptionAvailable as checkFrameOptionAvailable,
  type FrameVariantData,
} from '@/modules/catalog/utils/frameVariants'
import {
  buildLensSeries,
  findLensItemBySphereCylinder,
  formatLensValue,
  getDistinctLensValues,
  parseLensSku,
} from '@/modules/catalog/utils/lensSeries'
import { slugify } from '@/modules/catalog/utils/slug'
import { useAuthStore } from '@/modules/core/stores/auth'
import { useCartStore } from '@/modules/user/stores/cart'

export function useProductDetail(productId: number) {
  const router = useRouter()
  const toast = useToast()
  const auth = useAuthStore()
  const cart = useCartStore()

  const isLoading = ref(true)
  const hasError = ref(false)
  const isAddingToCart = ref(false)

  const product = ref<Product | null>(null)
  const categories = ref<ProductCategory[]>([])
  const productItems = ref<ProductItem[]>([])
  const configurationsByItemId = ref<Map<number, ProductConfiguration[]>>(new Map())

  const selectedLensSeriesQuantities = reactive<Record<string, number>>({})
  const selectedLensItemsBySeries = reactive<Record<string, number>>({})
  const selectedFrameOptions = reactive<Record<string, string>>({})

  const currentCategory = computed<ProductCategory | null>(() => {
    if (!product.value) return null
    return categories.value.find((category) => category.id === product.value?.category_id) ?? null
  })
  const categorySlug = computed(() => (currentCategory.value ? slugify(currentCategory.value.name) : null))
  const isLensProduct = computed(() => categorySlug.value === 'micas')
  const isFrameProduct = computed(() => categorySlug.value === 'armazones')

  const lensSeries = computed(() =>
    isLensProduct.value ? buildLensSeries(productItems.value, product.value?.image_path) : [],
  )
  const hasLensSeries = computed(() => lensSeries.value.length > 0)

  const frameVariantData = computed<FrameVariantData>(() =>
    isFrameProduct.value
      ? buildFrameVariantData(productItems.value, configurationsByItemId.value)
      : { variations: [], items: [] },
  )

  const selectedFrameItem = computed<ProductItem | null>(() => {
    if (!isFrameProduct.value) return null
    return findMatchingFrameItem(frameVariantData.value, selectedFrameOptions)
  })

  const selectedStandardItem = computed<ProductItem | null>(() => {
    if (isLensProduct.value || isFrameProduct.value) return null
    return productItems.value[0] ?? null
  })

  const selectedItem = computed<ProductItem | null>(() => {
    if (isFrameProduct.value) return selectedFrameItem.value
    if (isLensProduct.value) return null
    return selectedStandardItem.value
  })

  const displayImage = computed(() => {
    if (isFrameProduct.value && selectedFrameItem.value?.image_path) {
      return selectedFrameItem.value.image_path
    }
    return product.value?.image_path ?? ''
  })

  const displayPrice = computed(() => {
    if (isFrameProduct.value) return Number(selectedFrameItem.value?.price ?? 0)
    if (isLensProduct.value) return null
    return selectedStandardItem.value ? Number(selectedStandardItem.value.price ?? 0) : null
  })

  function getSelectedLensItem(series: (typeof lensSeries.value)[number]): ProductItem | null {
    const selectedItemId = selectedLensItemsBySeries[series.key]
    return series.items.find((item) => item.id === selectedItemId) ?? series.representativeItem
  }

  function getLensSphereOptions(series: (typeof lensSeries.value)[number]) {
    return getDistinctLensValues(series.items).spheres.map((value) => ({
      label: formatLensValue(value),
      value,
    }))
  }

  function getLensCylinderOptions(series: (typeof lensSeries.value)[number]) {
    return getDistinctLensValues(series.items).cylinders.map((value) => ({
      label: formatLensValue(value),
      value,
    }))
  }

  function getSelectedLensSphere(series: (typeof lensSeries.value)[number]): number | null {
    return parseLensSku(getSelectedLensItem(series)?.SKU)?.sphere ?? null
  }

  function getSelectedLensCylinder(series: (typeof lensSeries.value)[number]): number | null {
    return parseLensSku(getSelectedLensItem(series)?.SKU)?.cylinder ?? null
  }

  function selectLensItem(seriesKey: string, sphere: number, cylinder: number) {
    const series = lensSeries.value.find((entry) => entry.key === seriesKey)
    if (!series) return

    const item = findLensItemBySphereCylinder(series.items, sphere, cylinder)
    if (item) selectedLensItemsBySeries[seriesKey] = item.id
  }

  function initializeLensSelectors() {
    for (const series of lensSeries.value) {
      const selectedItemId = selectedLensItemsBySeries[series.key]
      const stillValid = series.items.some((item) => item.id === selectedItemId)

      if (!stillValid && series.representativeItem) {
        selectedLensItemsBySeries[series.key] = series.representativeItem.id
      }
    }
  }

  const selectedLensSeriesCartItems = computed(() => {
    if (!isLensProduct.value) return []

    return lensSeries.value
      .map((series) => {
        const quantity = Math.max(0, Number(selectedLensSeriesQuantities[series.key] ?? 0))
        const item = getSelectedLensItem(series)
        if (quantity <= 0 || !item?.id) return null
        return { series, item, quantity }
      })
      .filter(
        (entry): entry is { series: (typeof lensSeries.value)[number]; item: ProductItem; quantity: number } =>
          entry !== null,
      )
  })

  const selectedLensSeriesTotalQuantity = computed(() =>
    selectedLensSeriesCartItems.value.reduce((total, entry) => total + entry.quantity, 0),
  )
  const selectedLensSeriesTotalPrice = computed(() =>
    selectedLensSeriesCartItems.value.reduce(
      (total, entry) => total + entry.series.price * entry.quantity,
      0,
    ),
  )

  const purchaseAvailability = computed(() => {
    if (isLensProduct.value) {
      const selectedSeries = selectedLensSeriesCartItems.value
      const stock = selectedSeries.reduce((total, entry) => total + Number(entry.item.stock ?? 0), 0)

      if (!hasLensSeries.value) {
        return { isAvailable: false, stock: 0, label: 'No disponible', detail: 'Esta mica no tiene series disponibles.' }
      }
      if (selectedSeries.length === 0) {
        return {
          isAvailable: false,
          stock: 0,
          label: 'Selecciona una mica',
          detail: 'Elige la cantidad de al menos una mica para comprar.',
        }
      }

      const unavailableSeries = selectedSeries.filter((entry) => Number(entry.item.stock ?? 0) <= 0)
      if (unavailableSeries.length > 0) {
        return {
          isAvailable: false,
          stock,
          label: 'No disponible',
          detail: `${unavailableSeries.length} micas seleccionadas no tienen inventario.`,
        }
      }

      return {
        isAvailable: true,
        stock,
        label: 'Disponible',
        detail: `${selectedLensSeriesTotalQuantity.value} micas seleccionadas.`,
      }
    }

    const stock = Number(selectedItem.value?.stock ?? 0)

    return {
      isAvailable: stock > 0,
      stock,
      label: stock > 0 ? 'Disponible' : 'No disponible',
      detail: stock > 0 ? `${stock} unidades en inventario.` : 'Sin unidades disponibles en inventario.',
    }
  })

  const isAddToCartDisabled = computed(() => {
    if (isLensProduct.value) {
      return selectedLensSeriesCartItems.value.length === 0 || !purchaseAvailability.value.isAvailable
    }
    return !selectedItem.value?.id || !purchaseAvailability.value.isAvailable
  })

  function initializeFrameSelectors() {
    if (!isFrameProduct.value || frameVariantData.value.variations.length === 0) return

    for (const variation of frameVariantData.value.variations) {
      if (!selectedFrameOptions[variation.name]) {
        selectedFrameOptions[variation.name] = variation.options[0] ?? ''
      }
    }
  }

  function selectFrameOption(variationName: string, optionValue: string) {
    const variation = frameVariantData.value.variations.find((entry) => entry.name === variationName)
    if (variation && variation.options.length === 1) return

    selectedFrameOptions[variationName] = optionValue
  }

  function isFrameOptionAvailable(variationName: string, optionValue: string): boolean {
    return checkFrameOptionAvailable(frameVariantData.value, selectedFrameOptions, variationName, optionValue)
  }

  function setLensSeriesQuantity(seriesKey: string, quantity: number) {
    selectedLensSeriesQuantities[seriesKey] = Math.max(0, Number(quantity) || 0)
  }

  function increaseLensSeriesQuantity(seriesKey: string) {
    setLensSeriesQuantity(seriesKey, Number(selectedLensSeriesQuantities[seriesKey] ?? 0) + 1)
  }

  function decreaseLensSeriesQuantity(seriesKey: string) {
    setLensSeriesQuantity(seriesKey, Number(selectedLensSeriesQuantities[seriesKey] ?? 0) - 1)
  }

  watch(frameVariantData, () => initializeFrameSelectors(), { immediate: true })
  watch(lensSeries, () => initializeLensSelectors(), { immediate: true })

  async function load() {
    isLoading.value = true
    hasError.value = false

    try {
      const [productResult, categoriesResult, itemsResult] = await Promise.all([
        getProductById(productId),
        getCategories(),
        getProductItemsByProductId(productId),
      ])

      product.value = productResult
      categories.value = categoriesResult
      productItems.value = itemsResult

      const category = categoriesResult.find((entry) => entry.id === productResult.category_id)
      const isFrame = category ? slugify(category.name) === 'armazones' : false

      if (isFrame && itemsResult.length > 0) {
        const entries = await Promise.all(
          itemsResult.map(
            async (item): Promise<[number, ProductConfiguration[]]> => [
              item.id,
              await getProductConfigurationsByItem(item.id).catch(() => []),
            ],
          ),
        )
        configurationsByItemId.value = new Map(entries)
      }
    } catch {
      hasError.value = true
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener el producto',
        life: 4000,
      })
    } finally {
      isLoading.value = false
    }
  }

  async function addToCart() {
    if (!auth.isAuthenticated || !cart.canUseCart) {
      toast.add({
        severity: 'warn',
        summary: 'Inicia sesión',
        detail: auth.isAdmin
          ? 'El carrito solo esta disponible para usuarios compradores.'
          : 'Debes iniciar sesión para agregar productos al carrito.',
        life: 4000,
      })
      if (!auth.isAuthenticated) router.push({ name: 'login' })
      return
    }

    if (!purchaseAvailability.value.isAvailable) {
      toast.add({
        severity: 'warn',
        summary: 'No disponible',
        detail: 'Este producto no tiene disponibilidad suficiente para comprar.',
        life: 4500,
      })
      return
    }

    if (!product.value) return

    try {
      isAddingToCart.value = true

      if (isLensProduct.value) {
        for (const entry of selectedLensSeriesCartItems.value) {
          const item = entry.item

          await cart.addProduct(
            {
              id: product.value.id,
              category_id: product.value.category_id,
              product_item_id: item.id,
              code: item.SKU,
              SKU: item.SKU,
              name: `${product.value.name} - ${entry.series.label}`,
              description: product.value.description,
              price: entry.series.price,
              image_path: entry.series.image_path || product.value.image_path,
              stock: item.stock,
            },
            entry.quantity,
          )
        }

        toast.add({
          severity: 'success',
          summary: 'Agregado',
          detail: `${selectedLensSeriesTotalQuantity.value} series agregadas al carrito.`,
          life: 3000,
        })
        return
      }

      const item = selectedItem.value
      if (!item?.id) {
        toast.add({
          severity: 'error',
          summary: 'No disponible',
          detail: 'Este producto no tiene ítem de inventario asociado para carrito.',
          life: 4500,
        })
        return
      }

      await cart.addProduct(
        {
          id: product.value.id,
          category_id: product.value.category_id,
          product_item_id: item.id,
          code: item.SKU,
          SKU: item.SKU,
          name: product.value.name,
          description: product.value.description,
          price: item.price,
          image_path: displayImage.value,
          stock: item.stock,
          variation_options: isFrameProduct.value
            ? Object.entries(selectedFrameOptions).map(([variation_name, option_value]) => ({
                variation_id: null,
                variation_name,
                option_id: null,
                option_value,
              }))
            : [],
        },
        1,
      )

      toast.add({ severity: 'success', summary: 'Agregado', detail: 'Producto agregado al carrito.', life: 3000 })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'No se pudo agregar el producto al carrito.',
        life: 4500,
      })
    } finally {
      isAddingToCart.value = false
    }
  }

  function editProduct() {
    router.push({ name: 'admin-products-modify-form', params: { code: product.value?.id ?? productId } })
  }

  onMounted(async () => {
    if (cart.canUseCart) {
      await cart.initializeForSession().catch(() => {})
    }
    await load()
  })

  return {
    isLoading,
    hasError,
    isAddingToCart,
    product,
    currentCategory,
    categorySlug,
    isLensProduct,
    isFrameProduct,
    productItems,
    lensSeries,
    hasLensSeries,
    selectedLensSeriesQuantities,
    selectedLensSeriesTotalQuantity,
    selectedLensSeriesTotalPrice,
    frameVariantData,
    selectedFrameOptions,
    selectedFrameItem,
    selectedItem,
    displayImage,
    displayPrice,
    purchaseAvailability,
    isAddToCartDisabled,
    selectFrameOption,
    isFrameOptionAvailable,
    increaseLensSeriesQuantity,
    decreaseLensSeriesQuantity,
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
  }
}
