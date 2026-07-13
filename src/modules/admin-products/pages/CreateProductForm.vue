<script setup>
import {
  createEquipmentItemService,
  createFrameItemService,
  createProductItemService,
  createProductService,
  getAdminProductTypesService,
  getSuppliersByProductCategoryService,
  getVariationsService,
} from '@/modules/admin-products/services/adminProductsService'
import { normalizeApiError } from '@/modules/core/utils/normalizeApiError'
import {
  getCategorySlug,
  normalizeCategoriesPayload,
} from '@/modules/core/utils/productApiAdapters'
import { useToast } from 'primevue'
import { computed, onMounted, reactive, ref } from 'vue'

const toast = useToast()

const STEP_CENTS = 25

const productTypes = ref([])
const suppliers = ref([])
const variations = ref([])
const imagePreview = ref(null)
const imageInput = ref(null)
const isLoading = ref(true)
const isSuppliersLoading = ref(false)
const isSubmitting = ref(false)
const selectedTypeSlug = ref('')
const formErrors = ref([])
const successResult = ref(null)
const isFrameSelectionLocked = ref(false)
const isLensPreviewOpen = ref(false)
const createdLensSeriesResults = ref([])
const frameVariantImages = reactive({})
const frameVariantPrices = reactive({})
let suppliersRequestId = 0
let lensSeriesId = 0

const productInitialState = {
  image: null,
  file_name: '',
  category_id: null,
  supplier_id: null,
  name: '',
  description: '',
}

const productForm = reactive({ ...productInitialState })

const itemForm = reactive({
  sku: '',
  skuPrefix: '',
  price: '0.00',
})

const lensSeriesForms = reactive([createLensSeries()])

const selectedFrameOptionIds = reactive({})

function buildLensOptions(startCents, endCents) {
  const step = startCents <= endCents ? STEP_CENTS : -STEP_CENTS
  const options = []

  for (let cents = startCents; step > 0 ? cents <= endCents : cents >= endCents; cents += step) {
    options.push((cents / 100).toFixed(2))
  }

  return options
}

const sphereOptions = buildLensOptions(-600, 600)
const cylinderOptions = buildLensOptions(0, -600)

function createLensSeries(overrides = {}) {
  lensSeriesId += 1

  return {
    id: lensSeriesId,
    price: '0.00',
    sphereMin: '-6.00',
    sphereMax: '6.00',
    cylinderMin: '0.00',
    cylinderMax: '-6.00',
    image: null,
    previewUrl: null,
    ...overrides,
  }
}

const categoryCards = computed(() => {
  const labelBySlug = {
    equipos: 'Equipo',
    armazones: 'Armazón',
    micas: 'Mica',
  }
  const order = ['equipos', 'armazones', 'micas']

  return order
    .map((slug) => {
      const category = productTypes.value.find((type) => getCategorySlug(type?.name) === slug)

      return category ? { ...category, slug, label: labelBySlug[slug] } : null
    })
    .filter(Boolean)
})

const selectedCategory = computed(() => {
  return (
    productTypes.value.find((type) => getCategorySlug(type?.name) === selectedTypeSlug.value) ??
    null
  )
})

const selectedTypeLabel = computed(() => {
  return (
    categoryCards.value.find((category) => category.slug === selectedTypeSlug.value)?.label ?? ''
  )
})

const selectedCategorySuppliers = computed(() => {
  return suppliers.value
})

const frameVariations = computed(() => {
  const frameCategoryId = productTypes.value.find(
    (type) => getCategorySlug(type?.name) === 'armazones',
  )?.id

  return variations.value
    .filter((variation) => Number(variation?.category_id) === Number(frameCategoryId))
    .map((variation) => ({
      ...variation,
      variation_options: Array.isArray(variation?.variation_options)
        ? variation.variation_options
        : Array.isArray(variation?.variationOptions)
          ? variation.variationOptions
          : [],
    }))
})

const selectedFrameOptionsByVariation = computed(() => {
  return frameVariations.value
    .map((variation) => {
      const selectedIds = selectedFrameOptionIds[variation.id] ?? []
      const options = variation.variation_options.filter((option) =>
        selectedIds.includes(option.id),
      )

      return {
        variation,
        options,
      }
    })
    .filter((entry) => entry.options.length > 0)
})

const frameCombinations = computed(() => {
  const groups = selectedFrameOptionsByVariation.value.map((entry) => entry.options)

  if (groups.length === 0) return []

  return groups.reduce(
    (combinations, group) =>
      combinations.flatMap((combination) => group.map((option) => [...combination, option])),
    [[]],
  )
})

const frameVariantPreview = computed(() => {
  return frameCombinations.value.map((combination, index) => ({
    index,
    sku: buildGeneratedSku(itemForm.skuPrefix || 'SKU', index),
    options: combination.map((option) => option.value).join(' / '),
    image: frameVariantImages[index] ?? null,
    price: frameVariantPrices[index] ?? '0.00',
  }))
})

const lensSeriesValidations = computed(() => {
  return lensSeriesForms.map((series, index) => validateLensSeries(series, index))
})

const lensOverlapErrors = computed(() => {
  const errors = []
  const validRanges = lensSeriesValidations.value
    .map((validation, index) => ({ validation, index }))
    .filter((entry) => entry.validation.errors.length === 0)

  for (let leftIndex = 0; leftIndex < validRanges.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < validRanges.length; rightIndex += 1) {
      const left = validRanges[leftIndex]
      const right = validRanges[rightIndex]

      if (lensRangesOverlap(left.validation.range, right.validation.range)) {
        errors.push(`La Serie ${left.index + 1} se cruza con la Serie ${right.index + 1}.`)
      }
    }
  }

  return errors
})

const lensValidation = computed(() => {
  const seriesErrors = lensSeriesValidations.value.flatMap((validation) => validation.errors)
  const errors = [...seriesErrors, ...lensOverlapErrors.value]
  const total =
    errors.length === 0 ? buildLensPreviewOptions(lensSeriesValidations.value).length : 0

  return {
    errors,
    total,
    series: errors.length > 0 ? [] : lensSeriesValidations.value,
  }
})

const lensVariantPreview = computed(() => {
  if (lensOverlapErrors.value.length > 0) return []

  return buildLensPreviewOptions(lensSeriesValidations.value)
})

const lensSeriesPreviewCounts = computed(() => {
  return lensVariantPreview.value.reduce((counts, option) => {
    counts[option.seriesIndex] = (counts[option.seriesIndex] ?? 0) + 1

    return counts
  }, {})
})

function buildLensPreviewOptions(validations) {
  const seenCombinations = new Set()

  return validations.flatMap((validation, index) => {
    if (validation.errors.length > 0) return []

    const spheres = buildLensOptions(validation.sphereMinCents, validation.sphereMaxCents)
    const cylinders = buildLensOptions(validation.cylinderMinCents, validation.cylinderMaxCents)

    return spheres.flatMap((sphere) =>
      cylinders
        .map((cylinder) => {
          const key = `${sphere}|${cylinder}`

          if (seenCombinations.has(key)) return null

          seenCombinations.add(key)

          return {
            sphere,
            cylinder,
            seriesIndex: index,
            seriesLabel: `Serie ${index + 1}`,
            price: Number(lensSeriesForms[index]?.price || 0).toFixed(2),
          }
        })
        .filter(Boolean),
    )
  })
}

function validateLensSeries(series, index) {
  const errors = []
  const label = `Serie ${index + 1}`
  const sphereMinCents = parseToCents(series.sphereMin)
  const sphereMaxCents = parseToCents(series.sphereMax)
  const cylinderMinCents = parseToCents(series.cylinderMin)
  const cylinderMaxCents = parseToCents(series.cylinderMax)

  if (!isValidPrice(series.price)) errors.push(`${label}: captura un precio valido.`)
  if (sphereMinCents === null || sphereMaxCents === null)
    errors.push(`${label}: selecciona valores validos de esfera.`)
  if (cylinderMinCents === null || cylinderMaxCents === null)
    errors.push(`${label}: selecciona valores validos de cilindro.`)

  if (sphereMinCents !== null && sphereMaxCents !== null && sphereMinCents > sphereMaxCents) {
    errors.push(`${label}: la esfera inicial debe ser menor o igual a la final.`)
  }

  if (
    cylinderMinCents !== null &&
    cylinderMaxCents !== null &&
    cylinderMaxCents > cylinderMinCents
  ) {
    errors.push(`${label}: el cilindro final debe ser menor o igual al inicial.`)
  }

  const hasErrors = errors.length > 0
  const sphereCount = hasErrors ? 0 : (sphereMaxCents - sphereMinCents) / STEP_CENTS + 1
  const cylinderCount = hasErrors ? 0 : (cylinderMinCents - cylinderMaxCents) / STEP_CENTS + 1
  const range = hasErrors
    ? null
    : {
        sphereMin: Math.min(sphereMinCents, sphereMaxCents),
        sphereMax: Math.max(sphereMinCents, sphereMaxCents),
        cylinderMin: Math.min(cylinderMinCents, cylinderMaxCents),
        cylinderMax: Math.max(cylinderMinCents, cylinderMaxCents),
      }

  return {
    errors,
    sphereCount,
    cylinderCount,
    total: sphereCount * cylinderCount,
    range,
    sphereMinCents,
    sphereMaxCents,
    cylinderMinCents,
    cylinderMaxCents,
    payload: hasErrors
      ? null
      : {
          sphere: {
            min: centsToDecimal(sphereMinCents),
            max: centsToDecimal(sphereMaxCents),
          },
          cylinder: {
            min: centsToDecimal(cylinderMinCents),
            max: centsToDecimal(cylinderMaxCents),
          },
        },
  }
}

function lensRangesOverlap(leftRange, rightRange) {
  if (!leftRange || !rightRange) return false

  const sphereOverlaps =
    leftRange.sphereMin < rightRange.sphereMax && rightRange.sphereMin < leftRange.sphereMax
  const cylinderOverlaps =
    leftRange.cylinderMin < rightRange.cylinderMax && rightRange.cylinderMin < leftRange.cylinderMax

  return sphereOverlaps && cylinderOverlaps
}

function parseToCents(value) {
  const number = Number(String(value ?? '').replace(',', '.'))

  return Number.isFinite(number) ? Math.round(number * 100) : null
}

function centsToDecimal(cents) {
  return Number((cents / 100).toFixed(2))
}

function retrieveImage(event) {
  const file = event.target.files[0]

  if (!file) return

  productForm.image = file
  productForm.file_name = file.name
  imagePreview.value = URL.createObjectURL(file)
}

function normalizeSuppliersPayload(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.suppliers)) return payload.suppliers
  if (Array.isArray(payload?.data)) return payload.data

  return []
}

async function loadSuppliersByCategory(categoryId) {
  const requestId = ++suppliersRequestId

  suppliers.value = []
  productForm.supplier_id = null

  if (!categoryId) return

  isSuppliersLoading.value = true

  try {
    const response = await getSuppliersByProductCategoryService(categoryId)

    if (requestId !== suppliersRequestId) return

    suppliers.value = normalizeSuppliersPayload(response)
    productForm.supplier_id = suppliers.value[0]?.id ?? null
  } catch (error) {
    if (requestId !== suppliersRequestId) return

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron obtener los proveedores de la categoria seleccionada',
      life: 5000,
    })
  } finally {
    if (requestId === suppliersRequestId) isSuppliersLoading.value = false
  }
}

function selectProductType(slug) {
  selectedTypeSlug.value = slug
  productForm.category_id = selectedCategory.value?.id ?? null
  formErrors.value = []
  successResult.value = null
  isFrameSelectionLocked.value = false
  isLensPreviewOpen.value = false
  loadSuppliersByCategory(productForm.category_id)
}

function resetImageInput() {
  if (imageInput.value) imageInput.value.value = ''
}

function resetForm() {
  Object.assign(productForm, productInitialState)
  suppliers.value = []
  itemForm.sku = ''
  itemForm.skuPrefix = ''
  itemForm.price = '0.00'
  resetLensSeriesForms()
  Object.keys(selectedFrameOptionIds).forEach((key) => {
    selectedFrameOptionIds[key] = []
  })
  Object.keys(frameVariantImages).forEach((key) => {
    if (frameVariantImages[key]?.previewUrl) {
      URL.revokeObjectURL(frameVariantImages[key].previewUrl)
    }
    delete frameVariantImages[key]
  })
  Object.keys(frameVariantPrices).forEach((key) => {
    delete frameVariantPrices[key]
  })
  imagePreview.value = null
  selectedTypeSlug.value = ''
  isFrameSelectionLocked.value = false
  isLensPreviewOpen.value = false
  createdLensSeriesResults.value = []
  resetImageInput()
}

function resetFormAfterSubmit() {
  const successMessage = successResult.value
  const lensResults = createdLensSeriesResults.value

  resetForm()

  successResult.value = successMessage
  createdLensSeriesResults.value = lensResults
}

function addError(message) {
  if (message && !formErrors.value.includes(message)) formErrors.value.push(message)
}

function clearTransientFeedback() {
  formErrors.value = []
  successResult.value = null
  createdLensSeriesResults.value = []
}

function resetLensSeriesForms() {
  lensSeriesForms.forEach(revokeLensSeriesPreview)
  lensSeriesForms.splice(0, lensSeriesForms.length, createLensSeries())
}

function revokeLensSeriesPreview(series) {
  if (series?.previewUrl) {
    URL.revokeObjectURL(series.previewUrl)
  }
}

function addLensSeries() {
  clearTransientFeedback()
  lensSeriesForms.push(createLensSeries())
  isLensPreviewOpen.value = false
}

function removeLensSeries(index) {
  if (lensSeriesForms.length <= 1) return

  clearTransientFeedback()
  revokeLensSeriesPreview(lensSeriesForms[index])
  lensSeriesForms.splice(index, 1)
  isLensPreviewOpen.value = false
}

function assignLensSeriesImage(event, series) {
  const file = event.target.files?.[0]

  if (!file) return

  revokeLensSeriesPreview(series)
  clearTransientFeedback()
  series.image = file
  series.previewUrl = URL.createObjectURL(file)
}

function clearLensSeriesImage(series) {
  revokeLensSeriesPreview(series)
  clearTransientFeedback()
  series.image = null
  series.previewUrl = null
}

function validateBaseProduct() {
  formErrors.value = []

  if (!selectedTypeSlug.value) addError('Selecciona el tipo de producto.')
  if (!productForm.image) addError('Selecciona una imagen del producto.')
  if (!productForm.category_id) addError('Selecciona una categoria de producto.')
  if (!productForm.supplier_id) addError('Selecciona un proveedor.')
  if (
    selectedTypeSlug.value &&
    !isSuppliersLoading.value &&
    selectedCategorySuppliers.value.length === 0
  ) {
    addError('La categoria seleccionada no tiene proveedores asignados.')
  }
  if (!String(productForm.name).trim()) addError('Captura el nombre del producto.')
  if (!String(productForm.description).trim()) addError('Captura la descripcion del producto.')

  if (selectedTypeSlug.value === 'equipos') {
    if (!String(itemForm.sku).trim()) addError('Captura el SKU del equipo.')
    if (String(itemForm.sku).trim().length > 20)
      addError('El SKU del equipo no puede superar 20 caracteres.')
    if (!isValidPrice(itemForm.price)) addError('Captura un precio valido.')
  }

  if (selectedTypeSlug.value === 'armazones') {
    if (!String(itemForm.skuPrefix).trim()) addError('Captura el prefijo SKU del armazón.')
    frameVariations.value.forEach((variation) => {
      const selectedIds = selectedFrameOptionIds[variation.id] ?? []

      if (selectedIds.length === 0) {
        addError(`Selecciona al menos una opción de ${variation.name}.`)
      }
    })
    if (frameCombinations.value.length === 0)
      addError('Selecciona al menos una opción de variación.')
    if (!isFrameSelectionLocked.value) addError('Prepara las variantes antes de crear el armazón.')
    frameVariantPreview.value.forEach((variant) => {
      if (!isValidPrice(frameVariantPrices[variant.index])) {
        addError(`Captura un precio valido para la variante ${variant.sku}.`)
      }
    })
    if (
      buildGeneratedSku(itemForm.skuPrefix, Math.max(frameCombinations.value.length - 1, 0))
        .length > 20
    ) {
      addError('El prefijo SKU es muy largo para la cantidad de combinaciones.')
    }
  }

  if (selectedTypeSlug.value === 'micas') {
    if (lensSeriesForms.length === 0) addError('Agrega al menos una serie de micas.')
    lensValidation.value.errors.forEach(addError)
  }

  return formErrors.value.length === 0
}

function isValidPrice(value) {
  const price = Number(value)

  return Number.isFinite(price) && price >= 0
}

function buildProductFormData() {
  const formData = new FormData()

  formData.append('image', productForm.image)
  formData.append('file_name', productForm.file_name)
  formData.append('category_id', productForm.category_id)
  formData.append('supplier_id', productForm.supplier_id)
  formData.append('name', productForm.name)
  formData.append('description', productForm.description)

  return formData
}

function buildItemFormData(
  productId,
  sku,
  variationOptionIds = [],
  imageFile = productForm.image,
  price = itemForm.price,
) {
  const formData = new FormData()

  formData.append('image', imageFile)
  formData.append('file_name', imageFile?.name ?? productForm.file_name)
  formData.append('product_id', productId)
  formData.append('SKU', sku)
  formData.append('price', Number(price).toFixed(2))

  if (variationOptionIds.length > 0) {
    formData.append('variation_option_ids', variationOptionIds.join(','))
  }

  return formData
}

function buildLensItemFormData(productId, sku, series, fileName) {
  const imageFile = series.image ?? productForm.image
  const formData = new FormData()

  formData.append('image', imageFile)
  formData.append('file_name', fileName)
  formData.append('product_id', productId)
  formData.append('SKU', sku)
  formData.append('price', Number(series.price).toFixed(2))

  return formData
}

function getCreatedProduct(response) {
  return response?.product ?? response
}

function buildGeneratedSku(prefix, index) {
  return `${String(prefix).trim().toUpperCase()}-${index + 1}`
}

function buildSupplierSkuPrefix() {
  const supplier = suppliers.value.find(
    (entry) => Number(entry?.id) === Number(productForm.supplier_id),
  )
  const prefix = String(supplier?.name ?? '')
    .replace(/\s+/g, '')
    .slice(0, 4)
    .toUpperCase()

  return prefix || 'MICA'
}

function encodeLensSkuValue(value) {
  const number = Number(value)
  const fixed = Number.isFinite(number) ? number.toFixed(2) : '0.00'
  const digits = fixed.replace(/[.+-]/g, '')

  if (fixed.startsWith('-')) return `N${digits}`
  if (number > 0) return `P${digits}`

  return digits
}

function buildLensSku(supplierPrefix, sphere, cylinder) {
  return `${supplierPrefix}-S${encodeLensSkuValue(sphere)}-C${encodeLensSkuValue(cylinder)}`
}

function buildUploadFileName(file, context) {
  const originalName = String(file?.name ?? 'image').trim()
  const extensionMatch = originalName.match(/\.[^.]+$/)
  const extension = extensionMatch ? extensionMatch[0].toLowerCase() : ''
  const baseName =
    originalName
      .replace(/\.[^.]+$/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 28) || 'image'
  const safeContext = String(context)
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .slice(0, 24)

  return `${baseName}-${safeContext}-${Date.now()}${extension}`
}

function prepareFrameVariants() {
  formErrors.value = []

  if (!String(itemForm.skuPrefix).trim()) addError('Captura el prefijo SKU del armazón.')
  frameVariations.value.forEach((variation) => {
    const selectedIds = selectedFrameOptionIds[variation.id] ?? []

    if (selectedIds.length === 0) {
      addError(`Selecciona al menos una opción de ${variation.name}.`)
    }
  })
  if (frameCombinations.value.length === 0) addError('Selecciona al menos una opción de variación.')

  if (formErrors.value.length > 0) return

  frameCombinations.value.forEach((combination, index) => {
    if (frameVariantPrices[index] === undefined) {
      frameVariantPrices[index] = '0.00'
    }
  })

  isFrameSelectionLocked.value = true
}

function unlockFrameVariants() {
  isFrameSelectionLocked.value = false
  Object.keys(frameVariantImages).forEach((key) => {
    if (frameVariantImages[key]?.previewUrl) {
      URL.revokeObjectURL(frameVariantImages[key].previewUrl)
    }
    delete frameVariantImages[key]
  })
  Object.keys(frameVariantPrices).forEach((key) => {
    delete frameVariantPrices[key]
  })
}

function assignFrameVariantImage(event, index) {
  const file = event.target.files?.[0]

  if (!file) return

  if (frameVariantImages[index]?.previewUrl) {
    URL.revokeObjectURL(frameVariantImages[index].previewUrl)
  }

  frameVariantImages[index] = {
    file,
    previewUrl: URL.createObjectURL(file),
  }
}

function clearFrameVariantImage(index) {
  if (frameVariantImages[index]?.previewUrl) {
    URL.revokeObjectURL(frameVariantImages[index].previewUrl)
  }

  delete frameVariantImages[index]
}

async function createLensProductItems(productId) {
  const supplierPrefix = buildSupplierSkuPrefix()
  const optionsBySeries = lensVariantPreview.value.reduce((groups, option) => {
    groups[option.seriesIndex] = groups[option.seriesIndex] ?? []
    groups[option.seriesIndex].push(option)

    return groups
  }, {})
  const seriesResults = []

  for (const [index, series] of lensSeriesForms.entries()) {
    const validation = lensSeriesValidations.value[index]
    const options = optionsBySeries[index] ?? []
    const imageFile = series.image ?? productForm.image
    const fileName = buildUploadFileName(imageFile, `mica-${productId}-serie-${index + 1}`)
    const result = {
      id: series.id,
      label: `Serie ${index + 1}`,
      price: Number(series.price).toFixed(2),
      sphereMin: series.sphereMin,
      sphereMax: series.sphereMax,
      cylinderMin: series.cylinderMin,
      cylinderMax: series.cylinderMax,
      total: options.length || validation.total,
      created: 0,
      skipped: 0,
      hasImage: Boolean(series.image),
    }

    for (const option of options) {
      const sku = buildLensSku(supplierPrefix, option.sphere, option.cylinder)

      try {
        await createProductItemService(buildLensItemFormData(productId, sku, series, fileName))
        result.created += 1
      } catch (error) {
        const message = normalizeApiError(error)

        if (
          String(message).toLowerCase().includes('sku') ||
          String(message).toLowerCase().includes('identificador')
        ) {
          result.skipped += 1
          continue
        }

        throw error
      }
    }

    seriesResults.push(result)
  }

  return seriesResults
}

async function submitForm() {
  if (isSubmitting.value || !validateBaseProduct()) {
    toast.add({
      severity: 'warn',
      summary: 'Datos incompletos',
      detail: formErrors.value[0] ?? 'Revisa el formulario',
      life: 5000,
    })
    return
  }

  isSubmitting.value = true
  successResult.value = null

  try {
    const productResponse = await createProductService(buildProductFormData())
    const product = getCreatedProduct(productResponse)

    if (selectedTypeSlug.value === 'equipos') {
      await createEquipmentItemService(buildItemFormData(product.id, itemForm.sku))
      successResult.value = 'Producto de equipo creado con su SKU e inventario inicial.'
    }

    if (selectedTypeSlug.value === 'armazones') {
      for (const [index, combination] of frameCombinations.value.entries()) {
        await createFrameItemService(
          buildItemFormData(
            product.id,
            buildGeneratedSku(itemForm.skuPrefix, index),
            combination.map((option) => option.id),
            frameVariantImages[index]?.file,
            frameVariantPrices[index],
          ),
        )
      }

      successResult.value = `Armazón creado con ${frameCombinations.value.length} combinaciones.`
    }

    if (selectedTypeSlug.value === 'micas') {
      const seriesResults = await createLensProductItems(product.id)
      const createdTotal = seriesResults.reduce((total, result) => total + result.created, 0)
      const skippedTotal = seriesResults.reduce((total, result) => total + result.skipped, 0)

      createdLensSeriesResults.value = seriesResults
      successResult.value = `Mica creada en ${seriesResults.length} series. Items generados: ${createdTotal}. Existentes: ${skippedTotal}. Cada serie conserva su propia imagen.`
    }

    toast.add({
      severity: 'success',
      summary: 'Producto creado',
      detail: successResult.value,
      life: 7000,
    })

    resetFormAfterSubmit()
  } catch (error) {
    const detail = error?.errors
      ? normalizeApiError(error)
      : (error?.message ?? 'No se pudo completar la creación del producto.')

    formErrors.value = [detail]

    toast.add({
      severity: 'error',
      summary: 'No se pudo crear el producto',
      detail,
      life: 7000,
    })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const [productTypesResponse, variationsResponse] = await Promise.all([
      getAdminProductTypesService(),
      getVariationsService(),
    ])

    productTypes.value = normalizeCategoriesPayload(productTypesResponse)
    variations.value = Array.isArray(variationsResponse) ? variationsResponse : []

    variations.value.forEach((variation) => {
      selectedFrameOptionIds[variation.id] = []
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron obtener los datos iniciales del formulario',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div
    class="flex flex-col max-w-4xl mx-auto mt-12 md:mb-0 mb-12 md:px-10 md:py-10 px-8 gap-8 md:bg-white md:rounded-3xl md:shadow-2xl"
  >
    <div class="flex flex-col gap-2">
      <h2 class="text-3xl font-bold text-sky-800 text-center">Añadir producto</h2>
      <div class="grid grid-cols-3 gap-2 text-xs font-semibold text-center text-slate-500">
        <div
          :class="[
            selectedTypeSlug ? 'bg-sky-600 text-white' : 'bg-slate-100',
            'rounded-xl px-3 py-2',
          ]"
        >
          1. Tipo
        </div>
        <div
          :class="[
            selectedTypeSlug ? 'bg-sky-100 text-sky-800' : 'bg-slate-100',
            'rounded-xl px-3 py-2',
          ]"
        >
          2. Producto
        </div>
        <div
          :class="[
            selectedTypeSlug ? 'bg-sky-100 text-sky-800' : 'bg-slate-100',
            'rounded-xl px-3 py-2',
          ]"
        >
          3. Generación
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center gap-y-6 py-8">
      <div class="text-sky-600 pi pi-spinner-dotted animate-spin" style="font-size: 5rem"></div>
      <div class="text-xl font-semibold text-sky-700">Cargando formulario...</div>
    </div>

    <form v-else @submit.prevent="submitForm" class="flex flex-col gap-8">
      <section class="flex flex-col gap-4">
        <h3 class="text-xl font-bold text-sky-800">Tipo de producto</h3>
        <div class="grid md:grid-cols-3 grid-cols-1 gap-3">
          <button
            v-for="category in categoryCards"
            :key="category.id"
            type="button"
            @click="selectProductType(category.slug)"
            :class="[
              selectedTypeSlug === category.slug
                ? 'border-sky-600 bg-sky-50 text-sky-800'
                : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300',
              'rounded-xl border-2 px-4 py-5 text-lg font-bold transition',
            ]"
          >
            {{ category.label }}
          </button>
        </div>
      </section>

      <section v-if="selectedTypeSlug" class="grid md:grid-cols-[220px_1fr] grid-cols-1 gap-8">
        <div class="flex flex-col items-center gap-3">
          <button
            type="button"
            class="w-48 h-48 relative cursor-pointer group"
            @click="$refs.imageInput.click()"
          >
            <input
              id="image"
              ref="imageInput"
              @change="retrieveImage"
              type="file"
              accept="image/*"
              class="hidden"
            />
            <span
              class="w-full h-full flex items-center justify-center bg-slate-100 border-2 border-dashed border-sky-400 rounded-2xl transition hover:bg-sky-50"
            >
              <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="Vista previa"
                class="object-contain object-center w-full h-full rounded-2xl bg-white"
              />
              <span v-else class="text-sky-400 text-5xl font-bold select-none">+</span>
            </span>
          </button>
          <p class="text-sm text-center text-gray-600">
            {{
              selectedTypeSlug === 'micas'
                ? 'Imagen principal de tienda'
                : 'Imagen para producto e items'
            }}
          </p>
        </div>

        <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
          <div>
            <label class="block text-sky-700 font-medium mb-1">Tipo seleccionado</label>
            <input
              :value="selectedTypeLabel"
              type="text"
              disabled
              class="w-full p-3 rounded-xl border border-gray-200 bg-slate-100 text-slate-600"
            />
          </div>
          <div>
            <label for="supplier_id" class="block text-sky-700 font-medium mb-1">Proveedor</label>
            <select
              v-model="productForm.supplier_id"
              id="supplier_id"
              :disabled="isSuppliersLoading || selectedCategorySuppliers.length === 0"
              class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option v-if="isSuppliersLoading" disabled :value="null">
                Cargando proveedores...
              </option>
              <option v-else-if="selectedCategorySuppliers.length === 0" disabled :value="null">
                Sin proveedores asignados
              </option>
              <option
                v-for="supplier in selectedCategorySuppliers"
                :key="supplier.id"
                :value="supplier.id"
              >
                {{ supplier.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="name" class="block text-sky-700 font-medium mb-1"
              >Nombre del producto</label
            >
            <input
              v-model="productForm.name"
              id="name"
              type="text"
              class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
            />
          </div>
          <div>
            <label for="description" class="block text-sky-700 font-medium mb-1">Descripción</label>
            <input
              v-model="productForm.description"
              id="description"
              type="text"
              class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
            />
          </div>
        </div>
      </section>

      <section v-if="selectedTypeSlug === 'equipos'" class="grid md:grid-cols-2 grid-cols-1 gap-4">
        <div>
          <label for="equipment_sku" class="block text-sky-700 font-medium mb-1">SKU</label>
          <input
            v-model.trim="itemForm.sku"
            id="equipment_sku"
            maxlength="20"
            type="text"
            class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
          />
        </div>
        <div>
          <label for="equipment_price" class="block text-sky-700 font-medium mb-1">Precio</label>
          <input
            v-model="itemForm.price"
            id="equipment_price"
            type="number"
            min="0"
            step="0.01"
            class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
          />
        </div>
      </section>

      <section v-if="selectedTypeSlug === 'armazones'" class="flex flex-col gap-5">
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label for="frame_sku_prefix" class="block text-sky-700 font-medium mb-1"
              >Prefijo SKU</label
            >
            <input
              v-model.trim="itemForm.skuPrefix"
              id="frame_sku_prefix"
              maxlength="12"
              type="text"
              :disabled="isFrameSelectionLocked"
              class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300 disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
        </div>

        <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
          <div
            v-for="variation in frameVariations"
            :key="variation.id"
            class="rounded-xl border border-slate-200 p-4"
          >
            <div class="font-bold text-sky-800 mb-3">{{ variation.name }}</div>
            <div class="flex flex-wrap gap-3">
              <label
                v-for="option in variation.variation_options"
                :key="option.id"
                class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <input
                  v-model="selectedFrameOptionIds[variation.id]"
                  :value="option.id"
                  type="checkbox"
                  :disabled="isFrameSelectionLocked"
                  class="h-4 w-4 accent-sky-600 disabled:opacity-50"
                />
                {{ option.value }}
              </label>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="font-bold text-sky-800">
                Variantes preparadas: {{ frameCombinations.length }}
              </div>
              <div class="text-sm font-medium text-slate-600">
                Si no subes imagen propia, se usará la imagen principal del producto en esa
                variante.
              </div>
            </div>
            <button
              v-if="!isFrameSelectionLocked"
              type="button"
              class="rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700"
              @click="prepareFrameVariants"
            >
              Preparar variantes
            </button>
            <button
              v-else
              type="button"
              class="rounded-xl bg-slate-600 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
              @click="unlockFrameVariants"
            >
              Editar selección
            </button>
          </div>

          <div
            v-if="isFrameSelectionLocked"
            class="mt-4 max-h-[28rem] overflow-y-auto rounded-xl border border-sky-100 bg-white"
          >
            <div
              v-for="variant in frameVariantPreview"
              :key="variant.sku"
              class="grid gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 md:grid-cols-[8rem_1fr_10rem_12rem]"
            >
              <div class="font-bold text-sky-800">{{ variant.sku }}</div>
              <div class="font-medium text-slate-600">{{ variant.options }}</div>
              <div>
                <label
                  :for="`frame-price-${variant.index}`"
                  class="mb-1 block text-xs font-bold text-sky-700"
                  >Precio</label
                >
                <input
                  :id="`frame-price-${variant.index}`"
                  v-model="frameVariantPrices[variant.index]"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-sky-800 focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label
                  class="flex min-h-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-sky-300 bg-sky-50 px-3 py-2 text-center text-xs font-bold text-sky-700 transition hover:bg-sky-100"
                >
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="assignFrameVariantImage($event, variant.index)"
                  />
                  <span
                    v-if="variant.image?.previewUrl || imagePreview"
                    class="flex w-full flex-col items-center gap-1"
                  >
                    <img
                      :src="variant.image?.previewUrl || imagePreview"
                      alt="Imagen de variante"
                      class="h-16 w-full rounded-md bg-white object-contain object-center"
                    />
                    <span>{{
                      variant.image?.previewUrl ? 'Imagen propia' : 'Imagen del producto'
                    }}</span>
                  </span>
                  <span v-else>Subir imagen</span>
                </label>
                <button
                  v-if="variant.image?.previewUrl"
                  type="button"
                  class="rounded-lg border border-sky-200 px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-50"
                  @click="clearFrameVariantImage(variant.index)"
                >
                  Usar imagen del producto
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="selectedTypeSlug === 'micas'" class="flex flex-col gap-5">
        <div class="flex flex-col gap-4">
          <div
            v-for="(series, index) in lensSeriesForms"
            :key="series.id"
            class="rounded-xl border border-slate-200 p-4"
          >
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-lg font-bold text-sky-800">Serie {{ index + 1 }}</h3>
                <p class="text-sm font-medium text-slate-500">
                  {{ lensSeriesPreviewCounts[index] ?? 0 }} combinaciones con precio ${{
                    Number(series.price || 0).toFixed(2)
                  }}
                </p>
              </div>
              <button
                v-if="lensSeriesForms.length > 1"
                type="button"
                class="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                @click="removeLensSeries(index)"
              >
                Quitar serie
              </button>
            </div>

            <div class="grid gap-4 lg:grid-cols-[1fr_12rem]">
              <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
                <div class="md:col-span-2">
                  <label
                    :for="`lens-price-${series.id}`"
                    class="block text-sky-700 font-medium mb-1"
                    >Precio por mica</label
                  >
                  <input
                    v-model="series.price"
                    :id="`lens-price-${series.id}`"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
                    @input="clearTransientFeedback"
                  />
                </div>
                <div>
                  <label
                    :for="`sphere-min-${series.id}`"
                    class="block text-sky-700 font-medium mb-1"
                    >Esfera desde</label
                  >
                  <select
                    :id="`sphere-min-${series.id}`"
                    v-model="series.sphereMin"
                    class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
                    @change="clearTransientFeedback"
                  >
                    <option
                      v-for="option in sphereOptions"
                      :key="`sphere-min-${series.id}-${option}`"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    :for="`sphere-max-${series.id}`"
                    class="block text-sky-700 font-medium mb-1"
                    >Esfera hasta</label
                  >
                  <select
                    :id="`sphere-max-${series.id}`"
                    v-model="series.sphereMax"
                    class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
                    @change="clearTransientFeedback"
                  >
                    <option
                      v-for="option in sphereOptions"
                      :key="`sphere-max-${series.id}-${option}`"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    :for="`cylinder-min-${series.id}`"
                    class="block text-sky-700 font-medium mb-1"
                    >Cilindro desde</label
                  >
                  <select
                    :id="`cylinder-min-${series.id}`"
                    v-model="series.cylinderMin"
                    class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
                    @change="clearTransientFeedback"
                  >
                    <option
                      v-for="option in cylinderOptions"
                      :key="`cylinder-min-${series.id}-${option}`"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    :for="`cylinder-max-${series.id}`"
                    class="block text-sky-700 font-medium mb-1"
                    >Cilindro hasta</label
                  >
                  <select
                    :id="`cylinder-max-${series.id}`"
                    v-model="series.cylinderMax"
                    class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
                    @change="clearTransientFeedback"
                  >
                    <option
                      v-for="option in cylinderOptions"
                      :key="`cylinder-max-${series.id}-${option}`"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <div class="text-sm font-bold text-sky-700">Imagen de serie</div>
                <label
                  class="flex min-h-36 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-sky-300 bg-sky-50 px-3 py-2 text-center text-xs font-bold text-sky-700 transition hover:bg-sky-100"
                >
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="assignLensSeriesImage($event, series)"
                  />
                  <span
                    v-if="series.previewUrl || imagePreview"
                    class="flex w-full flex-col items-center gap-2"
                  >
                    <img
                      :src="series.previewUrl || imagePreview"
                      alt="Imagen de serie"
                      class="h-24 w-full rounded-md bg-white object-contain object-center"
                    />
                    <span>{{ series.previewUrl ? 'Imagen propia' : 'Imagen principal' }}</span>
                  </span>
                  <span v-else>Usar imagen principal</span>
                </label>
                <button
                  v-if="series.previewUrl"
                  type="button"
                  class="rounded-lg border border-sky-200 px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-50"
                  @click="clearLensSeriesImage(series)"
                >
                  Usar imagen del producto
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="rounded-xl border border-dashed border-sky-300 bg-sky-50 px-5 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-100"
            @click="addLensSeries"
          >
            Añadir serie
          </button>
        </div>

        <div
          class="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-800"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span>Total de items de mica: {{ lensValidation.total }}</span>
              <span>Series configuradas: {{ lensSeriesForms.length }}</span>
            </div>
            <button
              type="button"
              class="rounded-lg border border-sky-300 bg-white px-4 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
              :aria-expanded="isLensPreviewOpen"
              @click="isLensPreviewOpen = !isLensPreviewOpen"
            >
              {{ isLensPreviewOpen ? 'Ocultar combinaciones' : 'Mostrar combinaciones' }}
            </button>
          </div>

          <div v-if="isLensPreviewOpen" class="mt-4 rounded-xl border border-sky-100 bg-white p-3">
            <div class="max-h-72 overflow-y-auto pr-1">
              <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div
                  v-for="option in lensVariantPreview"
                  :key="`${option.seriesIndex}-${option.sphere}-${option.cylinder}`"
                  class="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-semibold text-slate-600"
                >
                  <div class="font-bold text-sky-800">
                    {{ option.seriesLabel }} · ${{ option.price }}
                  </div>
                  <div>Esfera {{ option.sphere }} | Cilindro {{ option.cylinder }}</div>
                </div>
              </div>
            </div>
            <div class="mt-3 text-xs font-medium text-slate-600">
              Se muestran {{ lensVariantPreview.length }} de
              {{ lensVariantPreview.length }} opciones.
            </div>
          </div>
        </div>
      </section>

      <section
        v-if="createdLensSeriesResults.length > 0"
        class="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
      >
        <div>
          <h3 class="text-xl font-bold text-emerald-800">Series de micas creadas</h3>
          <p class="text-sm font-medium text-emerald-700">
            Cada serie se creó con su precio e imagen propia desde el guardado inicial.
          </p>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <div
            v-for="seriesResult in createdLensSeriesResults"
            :key="seriesResult.id"
            class="rounded-xl border border-emerald-100 bg-white p-4"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div class="font-bold text-sky-800">{{ seriesResult.label }}</div>
                <div class="text-sm font-semibold text-slate-600">
                  Esfera {{ seriesResult.sphereMin }} a {{ seriesResult.sphereMax }} | Cilindro
                  {{ seriesResult.cylinderMin }} a {{ seriesResult.cylinderMax }}
                </div>
              </div>
              <div class="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                ${{ seriesResult.price }}
              </div>
            </div>
            <div class="mt-4 grid gap-2 text-sm font-semibold text-slate-600 sm:grid-cols-2">
              <div>Esperadas: {{ seriesResult.total }}</div>
              <div>Generadas: {{ seriesResult.created }}</div>
              <div>Existentes: {{ seriesResult.skipped }}</div>
              <div>{{ seriesResult.hasImage ? 'Imagen de serie' : 'Imagen principal' }}</div>
            </div>
          </div>
        </div>
      </section>

      <div v-if="formErrors.length > 0" class="rounded-xl border border-red-300 bg-red-50 p-4">
        <div class="font-semibold text-red-700 mb-2">Corrige estos errores</div>
        <ul class="list-disc pl-5 text-sm text-red-700">
          <li v-for="error in formErrors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <div
        v-if="successResult"
        class="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
      >
        {{ successResult }}
      </div>

      <button
        type="submit"
        :disabled="isSubmitting || !selectedTypeSlug"
        :class="[
          isSubmitting || !selectedTypeSlug ? 'bg-slate-400' : 'bg-sky-500 hover:bg-sky-600',
          'text-white font-semibold px-8 py-3 rounded-xl transition',
        ]"
      >
        {{ isSubmitting ? 'Creando...' : 'Crear producto' }}
      </button>
    </form>
  </div>

  <Toast position="bottom-right" />
</template>
