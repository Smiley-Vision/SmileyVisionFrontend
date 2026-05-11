<script setup>
import router from '@/app/router';
import { useCartStore } from '@/contexts/catalog/stores/cart';
import { useAuthStore } from '@/contexts/identity/stores/auth';
import { api } from '@/shared/infrastructure/http/api';
import { buildProductItemsByProductId, enrichProduct, getCategorySlug } from '@/shared/utils/productApiAdapters';
import { normalizeApiError } from '@/shared/utils/normalizeApiError';
import Button from 'primevue/button';
import Slider from 'primevue/slider';
import { useToast } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const backendUrl = import.meta.env.VITE_BACKEND_BASE
const STEP_CENTS = 25
const MICA_CATEGORY_ID = 1
const ARMAZON_CATEGORY_ID = 2

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()
const cart = useCartStore()

const productCode = route.params.code

const isLoading = ref(true)
const isAddingToCart = ref(false)
const product = ref({})
const productItemsForProduct = ref([])
const lensProductItems = ref([])
const frameProductItems = ref([])
const productConfigurations = ref([])
const selectedSphereRange = ref([0, 0])
const selectedCylinderRange = ref([0, 0])
const selectedFrameOptions = ref({})

const formatLensValue = (value) => {
    const numericValue = Number(value ?? 0)

    if (Object.is(numericValue, -0) || numericValue === 0) {
        return '0.00'
    }

    return numericValue.toFixed(2)
}

const parseLensSku = (sku) => {
    const normalizedSku = String(sku ?? '').trim().toUpperCase()
    const match = normalizedSku.match(/-S([NP]?)(\d{3})-CN(\d{3})$/)

    if (!match) return null

    const spherePrefix = match[1]
    const sphereMagnitude = Number(match[2]) / 100
    const cylinderMagnitude = Number(match[3]) / 100

    let sphere = 0

    if (spherePrefix === 'N') {
        sphere = -sphereMagnitude
    } else if (spherePrefix === 'P') {
        sphere = sphereMagnitude
    }

    return {
        sphere: Number(sphere.toFixed(2)),
        cylinder: Number((-cylinderMagnitude).toFixed(2))
    }
}

const buildLensVariants = (items) => {
    const sphereValues = new Set()
    const cylinderValues = new Set()
    const combinations = new Map()

    for (const item of items) {
        const parsedSku = parseLensSku(item?.SKU)

        if (!parsedSku) continue

        sphereValues.add(parsedSku.sphere)
        cylinderValues.add(parsedSku.cylinder)
        combinations.set(`${parsedSku.sphere}|${parsedSku.cylinder}`, {
            ...item,
            sphere: parsedSku.sphere,
            cylinder: parsedSku.cylinder
        })
    }

    const sortNumbers = (left, right) => left - right

    return {
        sphereValues: [...sphereValues].sort(sortNumbers),
        cylinderValues: [...cylinderValues].sort(sortNumbers),
        combinations
    }
}

const productCategorySlug = computed(() => getCategorySlug(product.value?.category?.name ?? product.value?.category_name ?? product.value?.category ?? ''))
const isLensProduct = computed(() => Number(product.value?.category_id) === MICA_CATEGORY_ID || productCategorySlug.value === 'micas')
const isFrameProduct = computed(() => Number(product.value?.category_id) === ARMAZON_CATEGORY_ID || productCategorySlug.value === 'armazones')
const shouldShowProductCode = computed(() => {
    return (
        !isLensProduct.value &&
        !isFrameProduct.value &&
        productCategorySlug.value !== 'micas'
    )
})

const lensVariants = computed(() => buildLensVariants(lensProductItems.value))

const parseStockValue = (value) => {
    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : null
}

const getProductItemStock = (item) => {
    if (!item) return 0

    const directStock = [
        item.stock,
        item.total_stock,
        item.available_stock,
        item.availability,
        item.existence
    ].map(parseStockValue).find((value) => value !== null)

    if (directStock !== undefined) return Math.max(0, directStock)

    const inventoryRows = Array.isArray(item.inventory)
        ? item.inventory
        : Array.isArray(item.inventories)
            ? item.inventories
            : Array.isArray(item.inventory_items)
                ? item.inventory_items
                : []

    return inventoryRows.reduce((total, inventoryRow) => {
        const stock = parseStockValue(inventoryRow?.stock)

        return total + Math.max(0, stock ?? 0)
    }, 0)
}

const sphereSliderBounds = computed(() => {
    const values = lensVariants.value.sphereValues

    return {
        min: values.length > 0 ? values[0] : -6,
        max: values.length > 0 ? values[values.length - 1] : 6
    }
})

const cylinderSliderBounds = computed(() => {
    const values = lensVariants.value.cylinderValues

    return {
        min: values.length > 0 ? values[0] : -6,
        max: values.length > 0 ? values[values.length - 1] : 0
    }
})

const availableSphereRange = computed(() => {
    if (!isLensProduct.value || lensVariants.value.sphereValues.length === 0) return null

    return {
        min: sphereSliderBounds.value.min,
        max: sphereSliderBounds.value.max
    }
})

const availableCylinderRange = computed(() => {
    if (!isLensProduct.value || lensVariants.value.cylinderValues.length === 0) return null

    return {
        min: cylinderSliderBounds.value.max,
        max: cylinderSliderBounds.value.min
    }
})

const selectedLensItem = computed(() => {
    if (!isLensProduct.value) return null

    const sphereStart = Number(selectedSphereRange.value?.[0])
    const cylinderStart = Number(selectedCylinderRange.value?.[0])

    return lensVariants.value.combinations.get(`${sphereStart}|${cylinderStart}`) ?? null
})

const selectedLensItems = computed(() => {
    if (!isLensProduct.value) return []

    const sphereStart = Number(selectedSphereRange.value?.[0])
    const sphereEnd = Number(selectedSphereRange.value?.[1])
    const cylinderStart = Number(selectedCylinderRange.value?.[0])
    const cylinderEnd = Number(selectedCylinderRange.value?.[1])

    return [...lensVariants.value.combinations.values()]
        .filter((item) => (
            Number(item.sphere) >= sphereStart &&
            Number(item.sphere) <= sphereEnd &&
            Number(item.cylinder) >= cylinderStart &&
            Number(item.cylinder) <= cylinderEnd
        ))
        .sort((left, right) => {
            if (left.sphere !== right.sphere) {
                return left.sphere - right.sphere
            }

            return left.cylinder - right.cylinder
        })
})

const selectedStandardItem = computed(() => {
    if (isLensProduct.value || isFrameProduct.value) return null

    return productItemsForProduct.value.find((item) => Number(item?.id) === Number(product.value?.product_item_id))
        ?? productItemsForProduct.value[0]
        ?? null
})

const selectedLensUnitPrice = computed(() => {
    if (!isLensProduct.value) return Number(product.value?.price ?? 0)

    const firstSelectedItem = selectedLensItems.value[0] ?? selectedLensItem.value
    const price = Number(firstSelectedItem?.price ?? product.value?.price ?? 0)

    return Number.isFinite(price) ? price : 0
})

const selectedLensTotalPrice = computed(() => {
    if (!isLensProduct.value) return Number(product.value?.price ?? 0)

    return selectedLensItems.value.reduce((total, item) => {
        const itemPrice = Number(item?.price ?? selectedLensUnitPrice.value)

        return total + (Number.isFinite(itemPrice) ? itemPrice : 0)
    }, 0)
})

const normalizeVariationName = (value) => {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

const sortFrameVariations = (left, right) => {
    const order = {
        color: 1,
        material: 2
    }

    const leftOrder = order[normalizeVariationName(left.name)] ?? 99
    const rightOrder = order[normalizeVariationName(right.name)] ?? 99

    if (leftOrder !== rightOrder) return leftOrder - rightOrder

    return String(left.name).localeCompare(String(right.name), 'es')
}

const frameVariantData = computed(() => {
    if (!isFrameProduct.value) {
        return {
            variations: [],
            items: []
        }
    }

    const productId = Number(product.value?.id)
    const itemsById = frameProductItems.value.reduce((map, item) => {
        map[Number(item?.id)] = {
            ...item,
            optionIds: new Set(),
            optionsByVariationId: {}
        }

        return map
    }, {})
    const variationsById = new Map()

    for (const configuration of productConfigurations.value) {
        const item = configuration?.product_item
        const itemId = Number(configuration?.product_item_id ?? item?.id)
        const itemProductId = Number(item?.product_id ?? itemsById[itemId]?.product_id)

        if (itemProductId !== productId) continue

        if (!itemsById[itemId]) {
            itemsById[itemId] = {
                ...item,
                optionIds: new Set(),
                optionsByVariationId: {}
            }
        }

        const variationOption = configuration?.variation_option
        const variation = variationOption?.variation
        const variationId = Number(variation?.id ?? variationOption?.variation_id)
        const optionId = Number(variationOption?.id ?? configuration?.variation_option_id)

        if (!variationId || !optionId) continue

        const option = {
            id: optionId,
            value: variationOption?.value ?? `Opcion ${optionId}`,
            variationId
        }

        if (!variationsById.has(variationId)) {
            variationsById.set(variationId, {
                id: variationId,
                name: variation?.name ?? `Variacion ${variationId}`,
                options: []
            })
        }

        const variationRecord = variationsById.get(variationId)
        if (!variationRecord.options.some((existingOption) => existingOption.id === option.id)) {
            variationRecord.options.push(option)
        }

        itemsById[itemId].optionIds.add(optionId)
        itemsById[itemId].optionsByVariationId[variationId] = optionId
    }

    const variations = [...variationsById.values()]
        .map((variation) => ({
            ...variation,
            options: variation.options.sort((left, right) => String(left.value).localeCompare(String(right.value), 'es'))
        }))
        .sort(sortFrameVariations)

    return {
        variations,
        items: Object.values(itemsById)
    }
})

const selectedFrameItem = computed(() => {
    if (!isFrameProduct.value) return null

    const selectedOptionIds = Object.values(selectedFrameOptions.value)
        .map((optionId) => Number(optionId))
        .filter(Boolean)

    if (selectedOptionIds.length === 0) {
        return frameVariantData.value.items[0] ?? null
    }

    return frameVariantData.value.items.find((item) => (
        selectedOptionIds.every((optionId) => item.optionIds?.has(optionId))
    )) ?? null
})

const selectedFramePrice = computed(() => {
    const price = Number(selectedFrameItem.value?.price ?? product.value?.price ?? 0)

    return Number.isFinite(price) ? price : 0
})

const selectedFrameVariationOptions = computed(() => {
    if (!isFrameProduct.value) return []

    return frameVariantData.value.variations
        .map((variation) => {
            const selectedOptionId = Number(selectedFrameOptions.value[variation.id])
            const selectedOption = variation.options.find((option) => Number(option.id) === selectedOptionId)

            if (!selectedOption) return null

            return {
                variation_id: variation.id,
                variation_name: variation.name,
                option_id: selectedOption.id,
                option_value: selectedOption.value
            }
        })
        .filter(Boolean)
})

const purchaseAvailability = computed(() => {
    if (isLensProduct.value) {
        const selectedItems = selectedLensItems.value
        const availableItems = selectedItems.filter((item) => getProductItemStock(item) > 0)
        const stock = availableItems.reduce((total, item) => total + getProductItemStock(item), 0)

        if (selectedItems.length === 0) {
            return {
                isAvailable: false,
                stock: 0,
                label: 'No disponible',
                detail: 'No hay combinaciones seleccionadas con inventario.'
            }
        }

        if (availableItems.length !== selectedItems.length) {
            return {
                isAvailable: false,
                stock,
                label: 'No disponible',
                detail: `${availableItems.length} de ${selectedItems.length} combinaciones tienen inventario.`
            }
        }

        return {
            isAvailable: true,
            stock,
            label: 'Disponible',
            detail: `${selectedItems.length} combinaciones disponibles.`
        }
    }

    const selectedItem = isFrameProduct.value ? selectedFrameItem.value : selectedStandardItem.value
    const stock = getProductItemStock(selectedItem)

    return {
        isAvailable: stock > 0,
        stock,
        label: stock > 0 ? 'Disponible' : 'No disponible',
        detail: stock > 0 ? `${stock} unidades en inventario.` : 'Sin unidades disponibles en inventario.'
    }
})

const lensSelectionSummary = computed(() => {
    if (!isLensProduct.value) return null

    return {
        sphereStart: formatLensValue(selectedSphereRange.value[0]),
        sphereEnd: formatLensValue(selectedSphereRange.value[1]),
        cylinderStart: formatLensValue(selectedCylinderRange.value[0]),
        cylinderEnd: formatLensValue(selectedCylinderRange.value[1])
    }
})

const isAddToCartDisabled = computed(() => {
    if (isLensProduct.value) {
        return selectedLensItems.value.length === 0 || !purchaseAvailability.value.isAvailable
    }

    if (isFrameProduct.value) {
        return !selectedFrameItem.value?.id || !purchaseAvailability.value.isAvailable
    }

    return !product.value?.product_item_id || !purchaseAvailability.value.isAvailable
})

function snapRangeToBounds(range, bounds) {
    const min = Number(bounds?.min ?? 0)
    const max = Number(bounds?.max ?? 0)
    const rawStart = Number(range?.[0] ?? min)
    const rawEnd = Number(range?.[1] ?? max)
    const start = Math.min(Math.max(rawStart, min), max)
    const end = Math.min(Math.max(rawEnd, min), max)

    return start <= end ? [start, end] : [end, start]
}

function initializeLensSelectors() {
    if (!isLensProduct.value) return

    selectedSphereRange.value = [sphereSliderBounds.value.min, sphereSliderBounds.value.max]
    selectedCylinderRange.value = [cylinderSliderBounds.value.max, cylinderSliderBounds.value.min]
}

function initializeFrameSelectors() {
    if (!isFrameProduct.value || frameVariantData.value.variations.length === 0) return

    selectedFrameOptions.value = frameVariantData.value.variations.reduce((selection, variation) => {
        selection[variation.id] = variation.options[0]?.id ?? null

        return selection
    }, {})
}

function selectFrameOption(variationId, optionId) {
    const variation = frameVariantData.value.variations.find((currentVariation) => Number(currentVariation.id) === Number(variationId))

    if (variation?.options.length === 1) return

    selectedFrameOptions.value = {
        ...selectedFrameOptions.value,
        [variationId]: optionId
    }
}

function isFrameOptionAvailable(variationId, optionId) {
    const selectedEntries = Object.entries(selectedFrameOptions.value)
        .filter(([currentVariationId, currentOptionId]) => (
            Number(currentVariationId) !== Number(variationId) &&
            Number(currentOptionId)
        ))
        .map(([, currentOptionId]) => Number(currentOptionId))

    return frameVariantData.value.items.some((item) => (
        item.optionIds?.has(Number(optionId)) &&
        selectedEntries.every((selectedOptionId) => item.optionIds?.has(selectedOptionId))
    ))
}

watch(lensVariants, (variants) => {
    if (!isLensProduct.value || variants.sphereValues.length === 0 || variants.cylinderValues.length === 0) {
        return
    }

    if (selectedSphereRange.value.length !== 2 || selectedCylinderRange.value.length !== 2) {
        initializeLensSelectors()
        return
    }

    selectedSphereRange.value = snapRangeToBounds(selectedSphereRange.value, sphereSliderBounds.value)
    selectedCylinderRange.value = snapRangeToBounds(selectedCylinderRange.value, cylinderSliderBounds.value)
}, { immediate: true })

watch(selectedLensItem, (item) => {
    if (!isLensProduct.value) return

    product.value = {
        ...product.value,
        product_item_id: item?.id ?? null,
        code: item?.SKU ?? product.value.code,
        price: item?.price ?? product.value.price,
        image_url: item?.product_image ?? product.value.image_url,
        stock: getProductItemStock(item)
    }
}, { immediate: true })

watch(frameVariantData, (variantData) => {
    if (!isFrameProduct.value || variantData.variations.length === 0) return

    const hasSelection = variantData.variations.every((variation) => selectedFrameOptions.value[variation.id])

    if (!hasSelection) {
        initializeFrameSelectors()
    }
}, { immediate: true })

watch(selectedFrameItem, (item) => {
    if (!isFrameProduct.value) return

    const nextProductItemId = item?.id ?? null
    const nextCode = item?.SKU ?? product.value.code
    const nextPrice = item?.price ?? product.value.price
    const nextImageUrl = item?.product_image ?? product.value.image_url
    const nextStock = getProductItemStock(item)
    const nextVariationOptions = selectedFrameVariationOptions.value

    if (
        product.value?.product_item_id === nextProductItemId &&
        product.value?.code === nextCode &&
        product.value?.price === nextPrice &&
        product.value?.image_url === nextImageUrl &&
        product.value?.stock === nextStock &&
        JSON.stringify(product.value?.variation_options ?? []) === JSON.stringify(nextVariationOptions)
    ) {
        return
    }

    product.value = {
        ...product.value,
        product_item_id: nextProductItemId,
        code: nextCode,
        SKU: nextCode,
        price: nextPrice,
        image_url: nextImageUrl,
        stock: nextStock,
        variation_options: nextVariationOptions
    }
}, { immediate: true })

// Format the price of the product (commas)
const formatPrice = (price) => {
    const numericPrice = Number(price ?? 0)

    if (!Number.isFinite(numericPrice)) {
        return '0.00'
    }

    return numericPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

// Get the product associated with the ID
onMounted(async () => {
    try {
        if (cart.canUseCart) {
            await cart.initializeForSession()
        }

        const [productResponse, productItemsResponse, productConfigurationsResponse] = await Promise.all([
            api.get(`products/${productCode}`),
            api.get('product-items'),
            api.get('product-configurations').catch(() => ({ data: [] }))
        ])
        const productItems = Array.isArray(productItemsResponse.data) ? productItemsResponse.data : []
        const productItemsByProductId = buildProductItemsByProductId(productItemsResponse.data)
        const enrichedProduct = enrichProduct(productResponse.data, productItemsByProductId)
        productConfigurations.value = Array.isArray(productConfigurationsResponse.data) ? productConfigurationsResponse.data : []
        productItemsForProduct.value = productItems
            .filter((item) => Number(item?.product_id) === Number(enrichedProduct?.id))
        const primaryProductItem = productItemsForProduct.value[0] ?? null

        product.value = {
            ...enrichedProduct,
            product_item_id: primaryProductItem?.id ?? enrichedProduct.product_item_id,
            code: primaryProductItem?.SKU ?? enrichedProduct.code,
            SKU: primaryProductItem?.SKU ?? enrichedProduct.SKU,
            price: primaryProductItem?.price ?? enrichedProduct.price,
            image_url: primaryProductItem?.product_image ?? enrichedProduct.image_url,
            stock: getProductItemStock(primaryProductItem)
        }
        lensProductItems.value = productItemsForProduct.value
        frameProductItems.value = productItemsForProduct.value

        if (isLensProduct.value) {
            initializeLensSelectors()
        }

        if (isFrameProduct.value) {
            initializeFrameSelectors()
        }

        isLoading.value = false
    } catch (error) {
        const apiError = normalizeApiError(error)
        const detail = apiError === 'Error inesperado'
            ? 'No se pudo obtener el producto'
            : `No se pudo obtener el producto: ${apiError}`

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail,
            life: 4000
        })
    }
})

const addToCart = async () => {
    if (!auth.isAuthenticated || !cart.canUseCart) {
        toast.add({
            severity: 'warn',
            summary: 'Inicia sesión',
            detail: auth.isAdmin
                ? 'El carrito solo esta disponible para usuarios compradores.'
                : 'Debes iniciar sesión para agregar productos al carrito.',
            life: 4000
        })
        if (!auth.isAuthenticated) {
            router.push({ name: 'login' })
        }
        return
    }

    if (!product.value?.product_item_id) {
        toast.add({
            severity: 'error',
            summary: 'No disponible',
            detail: 'Este producto no tiene item de inventario asociado para carrito.',
            life: 4500
        })
        return
    }

    if (!purchaseAvailability.value.isAvailable) {
        toast.add({
            severity: 'warn',
            summary: 'No disponible',
            detail: 'Este producto no tiene disponibilidad suficiente para comprar.',
            life: 4500
        })
        return
    }

    try {
        isAddingToCart.value = true

        if (isLensProduct.value) {
            await cart.addProducts(selectedLensItems.value.map((item) => ({
                ...product.value,
                product_item_id: item.id,
                code: item.SKU ?? product.value.code,
                SKU: item.SKU ?? product.value.code,
                price: item.price ?? product.value.price,
                image_url: item.product_image ?? product.value.image_url,
                stock: getProductItemStock(item)
            })), 1)

            toast.add({
                severity: 'success',
                summary: 'Agregado',
                detail: `${selectedLensItems.value.length} variantes agregadas al carrito.`,
                life: 3000
            })

            return
        }

        await cart.addProduct(product.value, 1)

        toast.add({
            severity: 'success',
            summary: 'Agregado',
            detail: 'Producto agregado al carrito.',
            life: 3000
        })
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.message ?? 'No se pudo agregar el producto al carrito.',
            life: 4500
        })
    } finally {
        isAddingToCart.value = false
    }
}

const editProduct = () => {
    router.push({
        name: 'admin-products-modify-form',
        params: {
            code: product.value?.id ?? productCode
        }
    })
}
</script>

<template>
    <!-- Loading screen -->
    <div v-if="isLoading" class="flex flex-col mx-auto my-auto items-center gap-y-8 mt-24">
        <div
            class="text-sky-800 pi pi-spinner-dotted animate-spin slow-spin"
            style="font-size: 8rem">
        </div>
        <div class="lg:text-5xl text-4xl text-sky-800 font-bold">
            Cargando...
        </div>
    </div>

    <!-- Content -->
    <div v-else class="flex flex-col items-center lg:px-20 px-8 mt-14 lg:gap-y-8 gap-y-6 2xl:mb-8 mb-12">

        <!-- Grouped left-aligned section -->
        <div class="flex flex-col items-start gap-y-6">

            <!-- Product details text -->
            <div class="font-semibold text-2xl text-sky-800">
                Detalles del producto
            </div>
    
            <!-- Product image and details -->
            <div class="flex lg:flex-row flex-col justify-center lg:gap-x-20 gap-y-8">
                
                <!-- Product image -->
                <img
                    :src="`${backendUrl}/storage/${product.image_url}`"
                    alt="Imagen del producto"
                    class="size-72 max-w-full object-contain object-center bg-white md:size-96 lg:size-[28rem] border-solid border-2 border-sky-600 rounded-lg shadow-xl"
                >
    
                <!-- Product details -->
                <div class="flex flex-col justify-center gap-y-5 lg:min-w-[24rem] max-w-lg">
    
                    <!-- Product name -->
                    <div class="font-semibold text-3xl text-sky-800">
                        {{ product.name }}
                    </div>
    
                    <!-- Product price -->
                    <div v-if="!isLensProduct && !isFrameProduct && product.price !== null" class="font-bold text-3xl text-sky-800">
                        {{ '$' + formatPrice(product.price) }}
                    </div>
                    <div v-else-if="!isLensProduct && !isFrameProduct" class="font-semibold text-lg text-slate-600">
                        Precio no disponible
                    </div>

                    <!-- Product code -->
                    <div v-if="shouldShowProductCode" class="flex flex-row gap-x-2">
                        <div class="font-semibold text-sky-800">
                            Codigo:
                        </div>
                        <div class="font-semibold text-sky-800">
                            {{ product.code }}
                        </div>
                    </div>
    
                    <!-- Description -->
                    <div v-if="!isFrameProduct" class="flex flex-col gap-y-2">
                        <div class="font-semibold text-lg text-sky-800">
                            Descripción
                        </div>
                        <div class="text-justify font-medium text-slate-600 max-w-md">
                            {{ product.description }}
                        </div>
                    </div>
    
                    <div v-if="isFrameProduct" class="flex flex-col gap-7">
                        <div
                            v-for="variation in frameVariantData.variations"
                            :key="variation.id"
                            class="flex flex-col gap-4"
                        >
                            <div class="font-semibold text-sky-800">
                                {{ variation.name }}:
                            </div>
                            <div class="flex flex-wrap gap-x-8 gap-y-3">
                                <label
                                    v-for="option in variation.options"
                                    :key="option.id"
                                    :class="[
                                        isFrameOptionAvailable(variation.id, option.id) ? 'cursor-pointer text-slate-600' : 'cursor-not-allowed text-slate-400',
                                        'inline-flex items-center gap-3 font-semibold'
                                    ]"
                                >
                                    <input
                                        type="checkbox"
                                        class="h-5 w-5 rounded border-slate-300 text-sky-800 focus:ring-sky-500"
                                        :checked="Number(selectedFrameOptions[variation.id]) === Number(option.id)"
                                        :disabled="variation.options.length === 1 || !isFrameOptionAvailable(variation.id, option.id)"
                                        @change="selectFrameOption(variation.id, option.id)"
                                    >
                                    <span>{{ option.value }}</span>
                                </label>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-baseline gap-x-2 font-semibold text-xl text-slate-600">
                            Precio: <span class="font-bold text-3xl text-sky-800">${{ formatPrice(selectedFramePrice) }} MXN</span>
                        </div>

                    </div>

                    <div
                        v-if="isLensProduct"
                        class="mt-2 flex flex-col gap-5 rounded-2xl border border-sky-100 bg-sky-50/80 p-5"
                    >
                        <div class="flex flex-col gap-1">
                            <div class="font-semibold text-lg text-sky-800">
                                Configura tu mica
                            </div>
                            <div class="text-sm text-slate-600">
                                Ajusta el rango de esferas y el rango de cilindros disponibles para esta mica.
                            </div>
                        </div>

                        <div class="flex flex-col gap-3">
                            <div class="flex items-center justify-between gap-4">
                                <div class="font-semibold text-sky-800">Esferas</div>
                                <div class="text-sm font-medium text-sky-800">
                                    {{ lensSelectionSummary?.sphereStart }} a {{ lensSelectionSummary?.sphereEnd }}
                                </div>
                            </div>
                            <Slider
                                v-model="selectedSphereRange"
                                range
                                :min="sphereSliderBounds.min"
                                :max="sphereSliderBounds.max"
                                :step="STEP_CENTS / 100"
                                class="w-full"
                            />
                            <div class="text-sm text-slate-600">
                                Disponibles en inventario: {{ formatLensValue(availableSphereRange?.min) }} a {{ formatLensValue(availableSphereRange?.max) }}
                            </div>
                        </div>

                        <div class="flex flex-col gap-3">
                            <div class="flex items-center justify-between gap-4">
                                <div class="font-semibold text-sky-800">Cilindros</div>
                                <div class="text-sm font-medium text-sky-800">
                                    {{ lensSelectionSummary?.cylinderStart }} a {{ lensSelectionSummary?.cylinderEnd }}
                                </div>
                            </div>
                            <Slider
                                v-model="selectedCylinderRange"
                                range
                                :min="cylinderSliderBounds.min"
                                :max="cylinderSliderBounds.max"
                                :step="STEP_CENTS / 100"
                                class="w-full"
                            />
                            <div class="text-sm text-slate-600">
                                Disponibles en inventario: {{ formatLensValue(availableCylinderRange?.min) }} a {{ formatLensValue(availableCylinderRange?.max) }}
                            </div>
                        </div>

                        <div class="rounded-xl border-2 border-slate-500 bg-white px-5 py-4">
                            <div class="flex items-center justify-between gap-4 text-lg text-slate-600">
                                <span>Total de combinaciones:</span>
                                <span class="font-semibold text-slate-600">{{ selectedLensItems.length }}</span>
                            </div>
                            <div class="mt-2 flex items-center justify-between gap-4 text-xl text-slate-600">
                                <span>Precio total estimado:</span>
                                <span class="font-bold text-3xl text-sky-800">${{ formatPrice(selectedLensTotalPrice) }}</span>
                            </div>
                        </div>
                    </div>

                    <div
                        :class="[
                            purchaseAvailability.isAvailable
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-red-200 bg-red-50 text-red-700',
                            'mt-2 rounded-xl border px-5 py-4 font-semibold'
                        ]"
                    >
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <span>Disponibilidad</span>
                            <span>{{ purchaseAvailability.label }}</span>
                        </div>
                        <div class="mt-1 text-sm font-medium">
                            {{ purchaseAvailability.detail }}
                        </div>
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
    </div>

    <Toast position="bottom-right"/>
</template>
