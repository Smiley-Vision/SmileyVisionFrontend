<script setup>
import {
    batchCreateLensItemsService,
    createEquipmentItemService,
    createFrameItemService,
    createProductService,
    getAdminProductTypesService,
    getProductItemsService,
    getSuppliersByProductCategoryService,
    getVariationsService,
    updateProductItemService,
    updateProductItemImageService
} from '@/contexts/admin-products/services/adminProductsService'
import { normalizeApiError } from '@/shared/utils/normalizeApiError'
import { getCategorySlug, normalizeCategoriesPayload } from '@/shared/utils/productApiAdapters'
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
const createdLensItems = ref([])
const lensImageAssignments = reactive({})
const lensPriceAssignments = reactive({})
const frameVariantImages = reactive({})
let suppliersRequestId = 0

const productInitialState = {
    image: null,
    file_name: '',
    category_id: null,
    supplier_id: null,
    name: '',
    description: ''
}

const productForm = reactive({ ...productInitialState })

const itemForm = reactive({
    sku: '',
    skuPrefix: '',
    price: '0.00'
})

const lensForm = reactive({
    sphereMin: '-6.00',
    sphereMax: '6.00',
    cylinderMin: '0.00',
    cylinderMax: '-6.00'
})

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

const categoryCards = computed(() => {
    const labelBySlug = {
        equipos: 'Equipo',
        armazones: 'Armazón',
        micas: 'Mica'
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
    return productTypes.value.find((type) => getCategorySlug(type?.name) === selectedTypeSlug.value) ?? null
})

const selectedTypeLabel = computed(() => {
    return categoryCards.value.find((category) => category.slug === selectedTypeSlug.value)?.label ?? ''
})

const selectedCategorySuppliers = computed(() => {
    return suppliers.value
})

const frameVariations = computed(() => {
    const frameCategoryId = productTypes.value.find((type) => getCategorySlug(type?.name) === 'armazones')?.id

    return variations.value
        .filter((variation) => Number(variation?.category_id) === Number(frameCategoryId))
        .map((variation) => ({
            ...variation,
            variation_options: Array.isArray(variation?.variation_options)
                ? variation.variation_options
                : Array.isArray(variation?.variationOptions)
                    ? variation.variationOptions
                    : []
        }))
})

const selectedFrameOptionsByVariation = computed(() => {
    return frameVariations.value
        .map((variation) => {
            const selectedIds = selectedFrameOptionIds[variation.id] ?? []
            const options = variation.variation_options.filter((option) => selectedIds.includes(option.id))

            return {
                variation,
                options
            }
        })
        .filter((entry) => entry.options.length > 0)
})

const frameCombinations = computed(() => {
    const groups = selectedFrameOptionsByVariation.value.map((entry) => entry.options)

    if (groups.length === 0) return []

    return groups.reduce((combinations, group) => (
        combinations.flatMap((combination) => group.map((option) => [...combination, option]))
    ), [[]])
})

const frameVariantPreview = computed(() => {
    return frameCombinations.value.map((combination, index) => ({
        index,
        sku: buildGeneratedSku(itemForm.skuPrefix || 'SKU', index),
        options: combination.map((option) => option.value).join(' / '),
        image: frameVariantImages[index] ?? null
    }))
})

const lensVariantPreview = computed(() => {
    const sphereMinCents = parseToCents(lensForm.sphereMin)
    const sphereMaxCents = parseToCents(lensForm.sphereMax)
    const cylinderMinCents = parseToCents(lensForm.cylinderMin)
    const cylinderMaxCents = parseToCents(lensForm.cylinderMax)

    if ([sphereMinCents, sphereMaxCents, cylinderMinCents, cylinderMaxCents].some((value) => value === null)) {
        return []
    }

    const spheres = buildLensOptions(sphereMinCents, sphereMaxCents)
    const cylinders = buildLensOptions(cylinderMinCents, cylinderMaxCents)

    return spheres.flatMap((sphere) => cylinders.map((cylinder) => ({
        sphere,
        cylinder
    })))
})

const visibleLensVariantPreview = computed(() => lensVariantPreview.value.slice(0, 16))

const lensValidation = computed(() => {
    const errors = []
    const sphereMinCents = parseToCents(lensForm.sphereMin)
    const sphereMaxCents = parseToCents(lensForm.sphereMax)
    const cylinderMinCents = parseToCents(lensForm.cylinderMin)
    const cylinderMaxCents = parseToCents(lensForm.cylinderMax)

    if (sphereMinCents === null || sphereMaxCents === null) errors.push('Esfera: selecciona valores validos.')
    if (cylinderMinCents === null || cylinderMaxCents === null) errors.push('Cilindro: selecciona valores validos.')

    if (sphereMinCents !== null && sphereMaxCents !== null && sphereMinCents > sphereMaxCents) {
        errors.push('Esfera: el valor inicial debe ser menor o igual al valor final.')
    }

    if (cylinderMinCents !== null && cylinderMaxCents !== null && cylinderMaxCents > cylinderMinCents) {
        errors.push('Cilindro: el valor final debe ser menor o igual al valor inicial.')
    }

    const sphereCount = errors.length === 0 ? (sphereMaxCents - sphereMinCents) / STEP_CENTS + 1 : 0
    const cylinderCount = errors.length === 0 ? (cylinderMinCents - cylinderMaxCents) / STEP_CENTS + 1 : 0

    return {
        errors,
        sphereCount,
        cylinderCount,
        total: sphereCount * cylinderCount,
        payload: errors.length > 0 ? null : {
            sphere: {
                min: centsToDecimal(sphereMinCents),
                max: centsToDecimal(sphereMaxCents)
            },
            cylinder: {
                min: centsToDecimal(cylinderMinCents),
                max: centsToDecimal(cylinderMaxCents)
            }
        }
    }
})

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
            life: 5000
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
    lensForm.sphereMin = '-6.00'
    lensForm.sphereMax = '6.00'
    lensForm.cylinderMin = '0.00'
    lensForm.cylinderMax = '-6.00'
    Object.keys(selectedFrameOptionIds).forEach((key) => {
        selectedFrameOptionIds[key] = []
    })
    Object.keys(frameVariantImages).forEach((key) => {
        delete frameVariantImages[key]
    })
    Object.keys(lensImageAssignments).forEach((key) => {
        delete lensImageAssignments[key]
    })
    Object.keys(lensPriceAssignments).forEach((key) => {
        delete lensPriceAssignments[key]
    })
    imagePreview.value = null
    selectedTypeSlug.value = ''
    isFrameSelectionLocked.value = false
    createdLensItems.value = []
    resetImageInput()
}

function addError(message) {
    if (message && !formErrors.value.includes(message)) formErrors.value.push(message)
}

function validateBaseProduct() {
    formErrors.value = []

    if (!selectedTypeSlug.value) addError('Selecciona el tipo de producto.')
    if (!productForm.image) addError('Selecciona una imagen del producto.')
    if (!productForm.category_id) addError('Selecciona una categoria de producto.')
    if (!productForm.supplier_id) addError('Selecciona un proveedor.')
    if (selectedTypeSlug.value && !isSuppliersLoading.value && selectedCategorySuppliers.value.length === 0) {
        addError('La categoria seleccionada no tiene proveedores asignados.')
    }
    if (!String(productForm.name).trim()) addError('Captura el nombre del producto.')
    if (!String(productForm.description).trim()) addError('Captura la descripcion del producto.')

    if (selectedTypeSlug.value === 'equipos') {
        if (!String(itemForm.sku).trim()) addError('Captura el SKU del equipo.')
        if (String(itemForm.sku).trim().length > 20) addError('El SKU del equipo no puede superar 20 caracteres.')
        if (!isValidPrice(itemForm.price)) addError('Captura un precio valido.')
    }

    if (selectedTypeSlug.value === 'armazones') {
        if (!String(itemForm.skuPrefix).trim()) addError('Captura el prefijo SKU del armazón.')
        if (!isValidPrice(itemForm.price)) addError('Captura un precio valido.')
        frameVariations.value.forEach((variation) => {
            const selectedIds = selectedFrameOptionIds[variation.id] ?? []

            if (selectedIds.length === 0) {
                addError(`Selecciona al menos una opción de ${variation.name}.`)
            }
        })
        if (frameCombinations.value.length === 0) addError('Selecciona al menos una opción de variación.')
        if (!isFrameSelectionLocked.value) addError('Prepara las variantes antes de crear el armazón.')
        frameVariantPreview.value.forEach((variant) => {
            if (!variant.image?.file) {
                addError(`Sube una imagen para la variante ${variant.sku}.`)
            }
        })
        if (buildGeneratedSku(itemForm.skuPrefix, Math.max(frameCombinations.value.length - 1, 0)).length > 20) {
            addError('El prefijo SKU es muy largo para la cantidad de combinaciones.')
        }
    }

    if (selectedTypeSlug.value === 'micas') {
        if (!isValidPrice(itemForm.price)) addError('Captura un precio valido.')
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

function buildItemFormData(productId, sku, variationOptionIds = [], imageFile = productForm.image) {
    const formData = new FormData()

    formData.append('image', imageFile)
    formData.append('file_name', imageFile?.name ?? productForm.file_name)
    formData.append('product_id', productId)
    formData.append('SKU', sku)
    formData.append('price', Number(itemForm.price).toFixed(2))

    if (variationOptionIds.length > 0) {
        formData.append('variation_option_ids', variationOptionIds.join(','))
    }

    return formData
}

function getCreatedProduct(response) {
    return response?.product ?? response
}

function buildGeneratedSku(prefix, index) {
    return `${String(prefix).trim().toUpperCase()}-${index + 1}`
}

function prepareFrameVariants() {
    formErrors.value = []

    if (!String(itemForm.skuPrefix).trim()) addError('Captura el prefijo SKU del armazón.')
    if (!isValidPrice(itemForm.price)) addError('Captura un precio valido.')
    frameVariations.value.forEach((variation) => {
        const selectedIds = selectedFrameOptionIds[variation.id] ?? []

        if (selectedIds.length === 0) {
            addError(`Selecciona al menos una opción de ${variation.name}.`)
        }
    })
    if (frameCombinations.value.length === 0) addError('Selecciona al menos una opción de variación.')

    if (formErrors.value.length > 0) return

    isFrameSelectionLocked.value = true
}

function unlockFrameVariants() {
    isFrameSelectionLocked.value = false
    Object.keys(frameVariantImages).forEach((key) => {
        delete frameVariantImages[key]
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
        previewUrl: URL.createObjectURL(file)
    }
}

async function loadCreatedLensItems(productId) {
    const response = await getProductItemsService()
    const items = Array.isArray(response) ? response : Array.isArray(response?.product_items) ? response.product_items : []

    createdLensItems.value = items.filter((item) => Number(item?.product_id) === Number(productId))
    createdLensItems.value.forEach((item) => {
        lensPriceAssignments[item.id] = {
            price: Number(item.price ?? itemForm.price ?? 0).toFixed(2),
            isSaving: false,
            isSaved: false
        }
    })
}

function assignLensImage(event, productItemId) {
    const file = event.target.files?.[0]

    if (!file) return

    if (lensImageAssignments[productItemId]?.previewUrl) {
        URL.revokeObjectURL(lensImageAssignments[productItemId].previewUrl)
    }

    lensImageAssignments[productItemId] = {
        file,
        previewUrl: URL.createObjectURL(file),
        isUploading: false,
        isUploaded: false
    }
}

async function uploadLensImage(productItemId) {
    const assignment = lensImageAssignments[productItemId]

    if (!assignment?.file) return

    assignment.isUploading = true

    try {
        const formData = new FormData()
        formData.append('image', assignment.file)
        formData.append('file_name', assignment.file.name)

        const response = await updateProductItemImageService(productItemId, formData)
        const updatedItem = response?.product_item
        const itemIndex = createdLensItems.value.findIndex((item) => Number(item.id) === Number(productItemId))

        if (itemIndex >= 0 && updatedItem) {
            createdLensItems.value[itemIndex] = updatedItem
        }

        assignment.isUploaded = true
        toast.add({
            severity: 'success',
            summary: 'Imagen actualizada',
            detail: 'La imagen de la mica se actualizó correctamente.',
            life: 3000
        })
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la imagen de la mica.',
            life: 4000
        })
    } finally {
        assignment.isUploading = false
    }
}

async function updateLensPrice(productItemId) {
    const assignment = lensPriceAssignments[productItemId]
    const price = Number(assignment?.price)

    if (!Number.isFinite(price) || price < 0) {
        toast.add({
            severity: 'warn',
            summary: 'Precio inválido',
            detail: 'Captura un precio válido para la mica.',
            life: 3500
        })
        return
    }

    assignment.isSaving = true

    try {
        await updateProductItemService(productItemId, {
            price: price.toFixed(2)
        })

        const itemIndex = createdLensItems.value.findIndex((item) => Number(item.id) === Number(productItemId))
        if (itemIndex >= 0) {
            createdLensItems.value[itemIndex] = {
                ...createdLensItems.value[itemIndex],
                price: price.toFixed(2)
            }
        }

        assignment.isSaved = true
        toast.add({
            severity: 'success',
            summary: 'Precio actualizado',
            detail: 'El precio de la mica se actualizó correctamente.',
            life: 3000
        })
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el precio de la mica.',
            life: 4000
        })
    } finally {
        assignment.isSaving = false
    }
}

async function submitForm() {
    if (isSubmitting.value || !validateBaseProduct()) {
        toast.add({
            severity: 'warn',
            summary: 'Datos incompletos',
            detail: formErrors.value[0] ?? 'Revisa el formulario',
            life: 5000
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
                await createFrameItemService(buildItemFormData(
                    product.id,
                    buildGeneratedSku(itemForm.skuPrefix, index),
                    combination.map((option) => option.id),
                    frameVariantImages[index]?.file
                ))
            }

            successResult.value = `Armazón creado con ${frameCombinations.value.length} combinaciones.`
        }

        if (selectedTypeSlug.value === 'micas') {
            const response = await batchCreateLensItemsService({
                product_id: Number(product.id),
                price: Number(itemForm.price).toFixed(2),
                ...lensValidation.value.payload
            })

            successResult.value = `Mica creada. Items generados: ${response.created}. Existentes: ${response.skipped}.`
            await loadCreatedLensItems(product.id)
        }

        toast.add({
            severity: 'success',
            summary: 'Producto creado',
            detail: successResult.value,
            life: 7000
        })

        if (selectedTypeSlug.value !== 'micas') {
            resetForm()
        }
    } catch (error) {
        const detail = error?.errors
            ? normalizeApiError(error)
            : error?.message ?? 'No se pudo completar la creación del producto.'

        formErrors.value = [detail]

        toast.add({
            severity: 'error',
            summary: 'No se pudo crear el producto',
            detail,
            life: 7000
        })
    } finally {
        isSubmitting.value = false
    }
}

onMounted(async () => {
    try {
        const [productTypesResponse, variationsResponse] = await Promise.all([
            getAdminProductTypesService(),
            getVariationsService()
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
            life: 5000
        })
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <div class="flex flex-col max-w-4xl mx-auto mt-12 md:mb-0 mb-12 md:px-10 md:py-10 px-8 gap-8 md:bg-white md:rounded-3xl md:shadow-2xl">
        <div class="flex flex-col gap-2">
            <h2 class="text-3xl font-bold text-sky-800 text-center">Añadir producto</h2>
            <div class="grid grid-cols-3 gap-2 text-xs font-semibold text-center text-slate-500">
                <div :class="[selectedTypeSlug ? 'bg-sky-600 text-white' : 'bg-slate-100', 'rounded-xl px-3 py-2']">1. Tipo</div>
                <div :class="[selectedTypeSlug ? 'bg-sky-100 text-sky-800' : 'bg-slate-100', 'rounded-xl px-3 py-2']">2. Producto</div>
                <div :class="[selectedTypeSlug ? 'bg-sky-100 text-sky-800' : 'bg-slate-100', 'rounded-xl px-3 py-2']">3. Generación</div>
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
                            selectedTypeSlug === category.slug ? 'border-sky-600 bg-sky-50 text-sky-800' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300',
                            'rounded-xl border-2 px-4 py-5 text-lg font-bold transition'
                        ]"
                    >
                        {{ category.label }}
                    </button>
                </div>
            </section>

            <section v-if="selectedTypeSlug" class="grid md:grid-cols-[220px_1fr] grid-cols-1 gap-8">
                <div class="flex flex-col items-center gap-3">
                    <button type="button" class="w-48 h-48 relative cursor-pointer group" @click="$refs.imageInput.click()">
                        <input id="image" ref="imageInput" @change="retrieveImage" type="file" accept="image/*" class="hidden" />
                        <span class="w-full h-full flex items-center justify-center bg-slate-100 border-2 border-dashed border-sky-400 rounded-2xl transition hover:bg-sky-50">
                            <img v-if="imagePreview" :src="imagePreview" alt="Vista previa" class="object-contain object-center w-full h-full rounded-2xl bg-white" />
                            <span v-else class="text-sky-400 text-5xl font-bold select-none">+</span>
                        </span>
                    </button>
                    <p class="text-sm text-center text-gray-600">Imagen para producto e items</p>
                </div>

                <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
                    <div>
                        <label class="block text-sky-700 font-medium mb-1">Tipo seleccionado</label>
                        <input :value="selectedTypeLabel" type="text" disabled class="w-full p-3 rounded-xl border border-gray-200 bg-slate-100 text-slate-600" />
                    </div>
                    <div>
                        <label for="supplier_id" class="block text-sky-700 font-medium mb-1">Proveedor</label>
                        <select
                            v-model="productForm.supplier_id"
                            id="supplier_id"
                            :disabled="isSuppliersLoading || selectedCategorySuppliers.length === 0"
                            class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300 disabled:bg-slate-100 disabled:text-slate-500"
                        >
                            <option v-if="isSuppliersLoading" disabled :value="null">Cargando proveedores...</option>
                            <option v-else-if="selectedCategorySuppliers.length === 0" disabled :value="null">Sin proveedores asignados</option>
                            <option v-for="supplier in selectedCategorySuppliers" :key="supplier.id" :value="supplier.id">
                                {{ supplier.name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label for="name" class="block text-sky-700 font-medium mb-1">Nombre del producto</label>
                        <input v-model="productForm.name" id="name" type="text" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" />
                    </div>
                    <div>
                        <label for="description" class="block text-sky-700 font-medium mb-1">Descripción</label>
                        <input v-model="productForm.description" id="description" type="text" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" />
                    </div>
                </div>
            </section>

            <section v-if="selectedTypeSlug === 'equipos'" class="grid md:grid-cols-2 grid-cols-1 gap-4">
                <div>
                    <label for="equipment_sku" class="block text-sky-700 font-medium mb-1">SKU</label>
                    <input v-model.trim="itemForm.sku" id="equipment_sku" maxlength="20" type="text" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" />
                </div>
                <div>
                    <label for="equipment_price" class="block text-sky-700 font-medium mb-1">Precio</label>
                    <input v-model="itemForm.price" id="equipment_price" type="number" min="0" step="0.01" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" />
                </div>
            </section>

            <section v-if="selectedTypeSlug === 'armazones'" class="flex flex-col gap-5">
                <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
                    <div>
                        <label for="frame_sku_prefix" class="block text-sky-700 font-medium mb-1">Prefijo SKU</label>
                        <input v-model.trim="itemForm.skuPrefix" id="frame_sku_prefix" maxlength="12" type="text" :disabled="isFrameSelectionLocked" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300 disabled:bg-slate-100 disabled:text-slate-500" />
                    </div>
                    <div>
                        <label for="frame_price" class="block text-sky-700 font-medium mb-1">Precio por combinación</label>
                        <input v-model="itemForm.price" id="frame_price" type="number" min="0" step="0.01" :disabled="isFrameSelectionLocked" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300 disabled:bg-slate-100 disabled:text-slate-500" />
                    </div>
                </div>

                <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
                    <div v-for="variation in frameVariations" :key="variation.id" class="rounded-xl border border-slate-200 p-4">
                        <div class="font-bold text-sky-800 mb-3">{{ variation.name }}</div>
                        <div class="flex flex-wrap gap-3">
                            <label v-for="option in variation.variation_options" :key="option.id" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <input v-model="selectedFrameOptionIds[variation.id]" :value="option.id" type="checkbox" :disabled="isFrameSelectionLocked" class="h-4 w-4 accent-sky-600 disabled:opacity-50" />
                                {{ option.value }}
                            </label>
                        </div>
                    </div>
                </div>

                <div class="rounded-xl border border-sky-200 bg-sky-50 p-4">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div class="font-bold text-sky-800">Variantes preparadas: {{ frameCombinations.length }}</div>
                            <div class="text-sm font-medium text-slate-600">
                                Prepara las variantes para bloquear la selección y revisar los SKU antes de crear.
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
                            class="grid gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 md:grid-cols-[8rem_1fr_12rem]"
                        >
                            <div class="font-bold text-sky-800">{{ variant.sku }}</div>
                            <div class="font-medium text-slate-600">{{ variant.options }}</div>
                            <label class="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-sky-300 bg-sky-50 px-3 py-2 text-center text-xs font-bold text-sky-700 transition hover:bg-sky-100">
                                <input
                                    type="file"
                                    accept="image/*"
                                    class="hidden"
                                    @change="assignFrameVariantImage($event, variant.index)"
                                >
                                <img
                                    v-if="variant.image?.previewUrl"
                                    :src="variant.image.previewUrl"
                                    alt="Imagen de variante"
                                    class="h-20 w-full rounded-md bg-white object-contain object-center"
                                >
                                <span v-else>Subir imagen</span>
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            <section v-if="selectedTypeSlug === 'micas'" class="flex flex-col gap-5">
                <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
                    <div class="md:col-span-2">
                        <label for="lens_price" class="block text-sky-700 font-medium mb-1">Precio por mica</label>
                        <input v-model="itemForm.price" id="lens_price" type="number" min="0" step="0.01" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" />
                    </div>
                    <div>
                        <label for="sphere_min" class="block text-sky-700 font-medium mb-1">Esfera desde</label>
                        <select id="sphere_min" v-model="lensForm.sphereMin" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300">
                            <option v-for="option in sphereOptions" :key="`sphere-min-${option}`" :value="option">{{ option }}</option>
                        </select>
                    </div>
                    <div>
                        <label for="sphere_max" class="block text-sky-700 font-medium mb-1">Esfera hasta</label>
                        <select id="sphere_max" v-model="lensForm.sphereMax" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300">
                            <option v-for="option in sphereOptions" :key="`sphere-max-${option}`" :value="option">{{ option }}</option>
                        </select>
                    </div>
                    <div>
                        <label for="cylinder_min" class="block text-sky-700 font-medium mb-1">Cilindro desde</label>
                        <select id="cylinder_min" v-model="lensForm.cylinderMin" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300">
                            <option v-for="option in cylinderOptions" :key="`cylinder-min-${option}`" :value="option">{{ option }}</option>
                        </select>
                    </div>
                    <div>
                        <label for="cylinder_max" class="block text-sky-700 font-medium mb-1">Cilindro hasta</label>
                        <select id="cylinder_max" v-model="lensForm.cylinderMax" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300">
                            <option v-for="option in cylinderOptions" :key="`cylinder-max-${option}`" :value="option">{{ option }}</option>
                        </select>
                    </div>
                </div>

                <div class="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-800">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <span>Total de items de mica: {{ lensValidation.total }}</span>
                        <span>Precio por item: ${{ Number(itemForm.price || 0).toFixed(2) }}</span>
                    </div>
                    <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <div
                            v-for="option in visibleLensVariantPreview"
                            :key="`${option.sphere}-${option.cylinder}`"
                            class="rounded-lg border border-sky-100 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                        >
                            Esfera {{ option.sphere }} | Cilindro {{ option.cylinder }}
                        </div>
                    </div>
                    <div v-if="lensVariantPreview.length > visibleLensVariantPreview.length" class="mt-3 text-xs font-medium text-slate-600">
                        Se muestran {{ visibleLensVariantPreview.length }} de {{ lensVariantPreview.length }} opciones.
                    </div>
                </div>
            </section>

            <section v-if="createdLensItems.length > 0" class="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div>
                    <h3 class="text-xl font-bold text-emerald-800">Imágenes para micas creadas</h3>
                    <p class="text-sm font-medium text-emerald-700">
                        La descripción se mantiene igual. Puedes subir una imagen específica por SKU ahora, o dejar la imagen base del producto.
                    </p>
                </div>
                <div class="grid gap-3 md:grid-cols-2">
                    <div
                        v-for="item in createdLensItems"
                        :key="item.id"
                        class="grid gap-3 rounded-xl border border-emerald-100 bg-white p-3 sm:grid-cols-[1fr_10rem]"
                    >
                        <div class="min-w-0">
                            <div class="font-bold text-sky-800">{{ item.SKU }}</div>
                            <label :for="`lens-price-${item.id}`" class="mt-2 block text-xs font-bold text-sky-700">Precio</label>
                            <div class="mt-1 grid grid-cols-[1fr_auto] gap-2">
                                <input
                                    :id="`lens-price-${item.id}`"
                                    v-model="lensPriceAssignments[item.id].price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    class="min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-sky-800 focus:ring-2 focus:ring-sky-300"
                                >
                                <button
                                    type="button"
                                    :disabled="lensPriceAssignments[item.id]?.isSaving"
                                    class="rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-700 disabled:bg-slate-400"
                                    @click="updateLensPrice(item.id)"
                                >
                                    {{ lensPriceAssignments[item.id]?.isSaving ? 'Guardando...' : lensPriceAssignments[item.id]?.isSaved ? 'Guardado' : 'Guardar' }}
                                </button>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="flex min-h-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-sky-300 bg-sky-50 px-3 py-2 text-center text-xs font-bold text-sky-700 transition hover:bg-sky-100">
                                <input
                                    type="file"
                                    accept="image/*"
                                    class="hidden"
                                    @change="assignLensImage($event, item.id)"
                                >
                                <img
                                    v-if="lensImageAssignments[item.id]?.previewUrl"
                                    :src="lensImageAssignments[item.id].previewUrl"
                                    alt="Imagen de mica"
                                    class="h-20 w-full rounded-md bg-white object-contain object-center"
                                >
                                <span v-else>Subir imagen</span>
                            </label>
                            <button
                                type="button"
                                :disabled="!lensImageAssignments[item.id]?.file || lensImageAssignments[item.id]?.isUploading"
                                :class="[
                                    !lensImageAssignments[item.id]?.file || lensImageAssignments[item.id]?.isUploading ? 'bg-slate-400' : 'bg-sky-600 hover:bg-sky-700',
                                    'rounded-lg px-3 py-2 text-xs font-bold text-white transition'
                                ]"
                                @click="uploadLensImage(item.id)"
                            >
                                {{ lensImageAssignments[item.id]?.isUploading ? 'Subiendo...' : lensImageAssignments[item.id]?.isUploaded ? 'Actualizar otra vez' : 'Guardar imagen' }}
                            </button>
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

            <div v-if="successResult" class="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                {{ successResult }}
            </div>

            <button
                type="submit"
                :disabled="isSubmitting || !selectedTypeSlug"
                :class="[
                    isSubmitting || !selectedTypeSlug ? 'bg-slate-400' : 'bg-sky-500 hover:bg-sky-600',
                    'text-white font-semibold px-8 py-3 rounded-xl transition'
                ]"
            >
                {{ isSubmitting ? 'Creando...' : 'Crear producto' }}
            </button>
        </form>
    </div>

    <Toast position="bottom-right" />
</template>
