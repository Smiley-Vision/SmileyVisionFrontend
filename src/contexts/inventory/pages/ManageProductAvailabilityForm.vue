<script setup>
import { api } from '@/shared/infrastructure/http/api';
import { buildProductItemsByProductId, enrichProduct } from '@/shared/utils/productApiAdapters';
import { useToast } from 'primevue';
import { computed } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const backendUrl = import.meta.env.VITE_BACKEND_BASE

const route = useRoute()
const toast = useToast()

const isLoading = ref(true)

const product = ref({})
const imagePreview = ref(null)
const selectedOfficeID = ref('')
const productStock = ref(0)
const initialStock = ref(0)
const productItemId = ref(null)
const branchOffices = ref([
    { id: 1, name: 'Smiley Mexico 1' },
    { id: 2, name: 'Smiley Mexico 2' },
    { id: 3, name: 'Smiley Merida' },
    { id: 4, name: 'Smiley Campeche' }
])

const productCode = route.params.code

const onOfficeChange = () => {
    initialStock.value = productStock.value
}

const hasProductItem = computed(() => productItemId.value !== null)

const isStockModified = computed(() => {
    return Number(productStock.value) !== Number(initialStock.value)
})

// Decrese the product's stock
const decrease = () => {
    if (Number(productStock.value) >= 1) productStock.value--
}

// Increase the product's stock
const increase = () => {
    productStock.value = Number(productStock.value) + 1
}

const submitForm = async () => {
    try {
        if (!selectedOfficeID.value || productItemId.value === null) {
            throw new Error('Datos incompletos para actualizar el inventario')
        }

        const body = {
            product_item_id: productItemId.value,
            branch_office_id: Number(selectedOfficeID.value),
            stock: Number(productStock.value)
        }

        await api.post('inventory', body)

        initialStock.value = productStock.value
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Se envio la actualizacion de stock',
            life: 4000
        })
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar inventario',
            life: 4000
        })
    }
}

// Retrieve the product and available product item
const retrieveData = async () => {
    const [productResponse, productItemsResponse] = await Promise.all([
        api.get(`products/${productCode}`),
        api.get('product-items')
    ])
    const productItemsByProductId = buildProductItemsByProductId(productItemsResponse.data)

    product.value = enrichProduct(productResponse.data, productItemsByProductId)
    productItemId.value = productItemsByProductId[product.value.id]?.id ?? null
}

onMounted(async () => {
    try {
        await retrieveData()
        imagePreview.value = `${backendUrl}/storage/${product.value.image_url}`
        isLoading.value = false

        if (!hasProductItem.value) {
            toast.add({
                severity: 'warn',
                summary: 'Atención',
                detail: 'Este producto no tiene SKU asociado. No se puede editar inventario.',
                life: 6000
            })
        }
        
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo obtener información del producto',
            life: 4000
        })
    }
})
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

    <!-- Form content -->
    <form v-else @submit.prevent="submitForm"
        class="flex flex-col items-center max-w-2xl mx-auto mt-12 md:mb-0 mb-12 md:px-10 md:py-10 px-8 gap-10 md:bg-white md:rounded-3xl md:shadow-2xl">

        <!-- Title -->
        <h2 class="text-3xl font-bold text-sky-800 text-center">Editar disponibilidad de {{ product.name }}</h2>

        <!-- Image preview -->
        <div class="w-48 h-48 relative group">
            <div
                class="w-full h-full flex items-center justify-center bg-slate-100 border-2 border-solid border-sky-400 rounded-2xl transition hover:bg-sky-50">
                <img v-if="imagePreview" :src="imagePreview" alt="Vista previa"
                    class="object-cover w-full h-full rounded-2xl" />
            </div>
        </div>

        <!-- Office selector -->
        <div class="flex flex-col gap-y-1">
            <label for="office" class="font-medium text-lg text-gray-700">Elegir sucursal:</label>
            <select
                id="office"
                v-model="selectedOfficeID"
                @change="onOfficeChange"
                :disabled="!hasProductItem"
                class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
                <option disabled hidden selected value="">-- Selecciona una sucursal --</option>
                <option v-for="(office, index) in branchOffices" :key="index" :value="office.id">
                    {{ office.name }}
                </option>
            </select>
        </div>

        <!-- Stock quantity selector / input -->
        <div class="flex flex-col items-center gap-y-4">
            <div class="font-semibold text-sky-800">
                Cantidad:
            </div>
            <div class="flex items-center gap-2">
                <button @click="decrease"
                        type="button"
                        :disabled="!hasProductItem"
                        class="w-8 h-8 rounded bg-sky-600 text-white font-bold hover:bg-sky-700">
                −
                </button>
    
                <input
                    v-model.number="productStock"
                    :disabled="!selectedOfficeID || !hasProductItem"
                    type="number"
                    min="0"
                    class="w-14 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
    
                <button @click="increase"
                        type="button"
                        :disabled="!hasProductItem"
                        class="w-8 h-8 rounded bg-sky-600 text-white font-bold hover:bg-sky-700">
                +
                </button>
            </div>
        </div>

        <div v-if="!hasProductItem" class="text-amber-600 text-center font-semibold">
            No se puede editar inventario porque este producto no tiene SKU asociado.
        </div>

        <!-- Current product info -->
        <div class="flex flex-row items-center gap-x-4">
            <div class="text-blue-400 pi pi-info-circle"></div>
            <div class="text-md text-blue-400 text-center font-bold">
                SKU del producto: {{ product.code }}
            </div>
        </div>

        <!-- Submit button -->
        <button
            type="submit"
            :disabled="!hasProductItem || !selectedOfficeID || !isStockModified"
            :class="[hasProductItem && selectedOfficeID && isStockModified ? 'bg-sky-500 hover:bg-sky-600' : 'bg-slate-400',
                                      'text-white font-semibold px-8 py-3 rounded-xl']"
        >
            ACEPTAR
        </button>
    </form>

    <Toast position="bottom-right"/>
</template>
