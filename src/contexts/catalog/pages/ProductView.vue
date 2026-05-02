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
const lensProductItems = ref([])
const selectedSphereRange = ref([0, 0])
const selectedCylinderRange = ref([0, 0])

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

const isLensProduct = computed(() => Number(product.value?.category_id) === MICA_CATEGORY_ID)
const productCategorySlug = computed(() => getCategorySlug(product.value?.category?.name ?? product.value?.category_name ?? product.value?.category ?? ''))
const shouldShowProductCode = computed(() => {
    return (
        !isLensProduct.value &&
        Number(product.value?.category_id) !== ARMAZON_CATEGORY_ID &&
        productCategorySlug.value !== 'micas' &&
        productCategorySlug.value !== 'armazones'
    )
})

const lensVariants = computed(() => buildLensVariants(lensProductItems.value))

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

const selectedCombinationLabel = computed(() => {
    if (!selectedLensItem.value) return 'No hay una combinacion exacta disponible para los valores actuales.'

    return `Esfera ${formatLensValue(selectedLensItem.value.sphere)} / Cilindro ${formatLensValue(selectedLensItem.value.cylinder)}`
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
        return selectedLensItems.value.length === 0
    }

    return !product.value?.product_item_id
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
        image_url: item?.product_image ?? product.value.image_url
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

const formatUnitPrice = (price) => {
    const numericPrice = Number(price ?? 0)

    if (!Number.isFinite(numericPrice)) {
        return '0.0'
    }

    return numericPrice.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
    })
}

// Get the product associated with the ID
onMounted(async () => {
    try {
        if (cart.canUseCart) {
            await cart.initializeForSession()
        }

        const [productResponse, productItemsResponse] = await Promise.all([
            api.get(`products/${productCode}`),
            api.get('product-items')
        ])
        const productItemsByProductId = buildProductItemsByProductId(productItemsResponse.data)
        product.value = enrichProduct(productResponse.data, productItemsByProductId)
        lensProductItems.value = (Array.isArray(productItemsResponse.data) ? productItemsResponse.data : [])
            .filter((item) => Number(item?.product_id) === Number(product.value?.id))

        if (Number(product.value?.category_id) === MICA_CATEGORY_ID) {
            initializeLensSelectors()
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

    try {
        isAddingToCart.value = true

        if (isLensProduct.value) {
            await cart.addProducts(selectedLensItems.value.map((item) => ({
                ...product.value,
                product_item_id: item.id,
                code: item.SKU ?? product.value.code,
                SKU: item.SKU ?? product.value.code,
                price: item.price ?? product.value.price,
                image_url: item.product_image ?? product.value.image_url
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
            class="text-sky-600 pi pi-spinner-dotted animate-spin slow-spin"
            style="font-size: 8rem">
        </div>
        <div class="lg:text-5xl text-4xl text-sky-700 font-bold">
            Cargando...
        </div>
    </div>

    <!-- Content -->
    <div v-else class="flex flex-col items-center lg:px-20 px-14 mt-14 lg:gap-y-8 gap-y-6 2xl:mb-8 mb-12">

        <!-- Grouped left-aligned section -->
        <div class="flex flex-col items-start gap-y-6">

            <!-- Product details text -->
            <div class="font-semibold text-2xl text-sky-700">
                Detalles del producto
            </div>
    
            <!-- Product image and details -->
            <div class="flex lg:flex-row flex-col justify-center lg:gap-x-10 gap-y-4">
                
                <!-- Product image -->
                <img
                    :src="`${backendUrl}/storage/${product.image_url}`"
                    alt="Imagen del producto"
                    class="lg:size-[28rem] border-solid border-2 border-sky-600 rounded-lg shadow-xl"
                >
    
                <!-- Product details -->
                <div class="flex flex-col justify-center gap-y-4">
    
                    <!-- Product name -->
                    <div class="font-semibold text-xl text-sky-800">
                        {{ product.name }}
                    </div>
    
                    <!-- Product price -->
                    <div v-if="product.price !== null" class="font-bold text-2xl text-sky-600">
                        <template v-if="isLensProduct">
                            {{ '$' + formatUnitPrice(selectedLensUnitPrice) }} c/u
                        </template>
                        <template v-else>
                            {{ '$' + formatPrice(product.price) }}
                        </template>
                    </div>
                    <div v-else class="font-semibold text-lg text-slate-500">
                        Precio no disponible
                    </div>

                    <!-- Product code -->
                    <div v-if="shouldShowProductCode" class="flex flex-row gap-x-2">
                        <div class="font-semibold text-sky-800">
                            Codigo:
                        </div>
                        <div class="font-semibold text-sky-600">
                            {{ product.code }}
                        </div>
                    </div>
    
                    <!-- Description -->
                    <div class="flex flex-col gap-y-2">
                        <div class="font-semibold text-lg text-sky-800">
                            Descripción
                        </div>
                        <div class="text-justify font-medium text-sky-800 max-w-md">
                            {{ product.description }}
                        </div>
                    </div>
    
                    <div class="font-semibold text-slate-500">
                        Disponibilidad no visible en esta version.
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
                                <div class="text-sm font-medium text-sky-700">
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
                                <div class="text-sm font-medium text-sky-700">
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

                        <div class="rounded-xl border border-sky-200 bg-white/80 px-4 py-3 text-sm text-slate-700">
                            Se agregarán <span class="font-semibold text-sky-800">{{ selectedLensItems.length }}</span> variantes al carrito con la configuración seleccionada.
                        </div>

                        <div class="rounded-xl border border-sky-300 bg-white px-4 py-4">
                            <div class="flex items-center justify-between gap-4 text-sm text-slate-700">
                                <span>Variantes seleccionadas</span>
                                <span class="font-semibold text-sky-800">{{ selectedLensItems.length }}</span>
                            </div>
                            <div class="mt-2 flex items-center justify-between gap-4 text-lg font-bold text-sky-800">
                                <span>Total</span>
                                <span>${{ formatPrice(selectedLensTotalPrice) }}</span>
                            </div>
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
