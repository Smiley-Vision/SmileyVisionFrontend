<script setup>
import { fetchData } from '@/utils/api';
import { useToast } from 'primevue';
import { computed } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const backendUrl = import.meta.env.VITE_BACKEND_URL

const route = useRoute()
const toast = useToast()

const isLoading = ref(true)

const product = ref({})
const offices = ref([])
const imagePreview = ref(null)
const selectedOfficeID = ref('')
const productStock = ref(null)
const initialStock = ref(null)
const totalScotk = ref(null)

const productCode = route.params.code

const getOfficeAvailability = async () => {
    const result = productStock.value = await fetchData(`product-existence/${product.value.id}/${selectedOfficeID.value}`, 'GET')
    productStock.value = result
    initialStock.value = result
}

const isStockModified = computed(() => {
    return productStock.value !== initialStock.value
})

// Decrese the product's stock
const decrease = () => {
  if (productStock.value >= 1) productStock.value--;
}

// Increase the product's stock
const increase = () => {
    productStock.value++
}

const submitForm = async () => {
    try {
        const body = {
            product_id: product.value.id,
            branch_office_id: selectedOfficeID.value,
            stock: productStock.value
        }

        const response = await fetchData('product-existence', 'POST', body)

        if (response.message === 'Product stock updated successfully') {
            initialStock.value = productStock.value
            totalScotk.value = await fetchData(`product-existence/${product.value.id}`, 'GET')
            
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Se actualizó el stock del producto',
                life: 4000
            })
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al modificar el stock del producto',
            life: 4000
        })
    }
}

// Retrieve the product and available offices
const retrieveData = async () => {
    product.value = await fetchData(`products/${productCode}`, 'GET')
    offices.value = await fetchData('offices', 'GET')
    totalScotk.value = await fetchData(`product-existence/${product.value.id}`, 'GET')
}

onMounted(async () => {
    try {
        await retrieveData()
        imagePreview.value = `${backendUrl}/storage/${product.value.image_url}`
        isLoading.value = false
        
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
        class="flex flex-col items-center max-w-2xl mx-auto my-12 p-10 gap-10 bg-white rounded-3xl shadow-2xl">

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
                @change="getOfficeAvailability"
                class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
                <option disabled hidden selected value="">-- Selecciona una sucursal --</option>
                <option v-for="(office, index) in offices" :key="index" :value="office.id">
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
                        class="w-8 h-8 rounded bg-sky-600 text-white font-bold hover:bg-sky-700">
                −
                </button>
    
                <input
                    min="1"
                    :value="productStock"
                    class="w-14 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
    
                <button @click="increase"
                        type="button"
                        class="w-8 h-8 rounded bg-sky-600 text-white font-bold hover:bg-sky-700">
                +
                </button>
            </div>
        </div>

        <!-- Current total product stock -->
        <div class="flex flex-row items-center gap-x-4">
            <div class="text-blue-400 pi pi-info-circle"></div>
            <div class="text-md text-blue-400 font-bold">
                El stock total actual del producto es de {{ totalScotk }} unidades
            </div>
        </div>

        <!-- Submit button -->
        <button
            type="submit"
            :disabled="!isStockModified"
            :class="[isStockModified ? 'bg-sky-500 hover:bg-sky-600' : 'bg-slate-400',
                                      'text-white font-semibold px-8 py-3 rounded-xl']"
        >
            ACEPTAR
        </button>
    </form>

    <Toast position="bottom-right"/>
</template>