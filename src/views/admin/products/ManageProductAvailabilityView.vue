<script setup>
import { fetchData } from '@/utils/api';
import { useToast } from 'primevue';
import { onMounted } from 'vue';
import { ref } from 'vue';

const backendUrl = import.meta.env.VITE_BACKEND_URL

const toast = useToast()

const searchQuery = ref('')
const productTypes = ref([])
const selectedType = ref(0)
const products = ref([])

const isLoading = ref(false)
const isSearchQueryEmpty = ref(true)

// Fetch products with the search query
const fetchFilteredProducts = async () => {
    try {
        if (searchQuery.value === '') {
            isSearchQueryEmpty.value = true
            return   
        }

        isLoading.value = true
        isSearchQueryEmpty.value = false
        const response = await fetchData(`products/query/${searchQuery.value}/${selectedType.value}`, 'GET')

        isLoading.value = false
        products.value = response.products
        
    } catch (error) {
        isLoading.value = false
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Prueba con otra búsqueda',
            life: 4000
        })
    }
}

// Fetch the product types
onMounted(async () => {
    try {
        const response = await fetchData('product-types', 'GET')
        productTypes.value = response   
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron obtener los tipos de producto',
            life: 4000
        })
    }
})
</script>

<template>
    <div class="flex flex-col lg:px-20 px-14 py-14 lg:gap-y-10 gap-y-10 2xl:mb-0 mb-12">
        <!-- Descriptive title -->
        <div class="text-3xl font-semibold text-sky-800">
            Busque un producto para disponibilidad
        </div>

        <!-- Search bar and type selector -->
        <div class="flex lg:flex-row flex-col lg:gap-x-12 lg:gap-y-0 gap-y-8">
            <input
                v-model="searchQuery"
                @input="fetchFilteredProducts"
                placeholder="Buscar por nombre o por código..."
                class="lg:w-2/3 w-full p-2 border border-2 border-solid border-slate-300 rounded-xl"
            >
            <select
                v-model="selectedType"
                @change="fetchFilteredProducts"
                name="type"
                id="type"
                :class="[
                    'lg:w-1/3 w-full p-2 border border-2 border-solid border-slate-300 rounded-xl text-black'
                ]"
                >
                <option value="0">Todas las categorías</option>
                <option
                    v-for="(type, index) in productTypes"
                    :key="index"
                    :value="index + 1"
                >
                    {{ type.name }}
                </option>
            </select>
        </div>

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

        <!-- Products grid -->
        <div v-else class="flex mx-auto items-center xl:grid xl:grid-cols-4 lg:grid lg:grid-cols-3 sm:grid sm:grid-cols-2 text-center flex-col gap-x-20 gap-y-12 pt-4">
            <div v-for="product in products" class="flex flex-col items-center gap-y-4 font-semibold text-xl text-sky-700">
                
                <!-- Product name -->
                <div class="text-lg text-sky-700 font-semibold">
                    {{ product.name }}
                </div>

                <!-- Product image -->
                <img
                    :src="`${backendUrl}/storage/${product.image_url}`"
                    class="lg:size-60 size-40 border-solid border-2 border-sky-600 rounded-xl shadow-lg
                            hover:shadow-2xl transform transition duration-200 hover:scale-105"
                >

                <!-- Product Code -->
                <div class="flex flex-row gap-x-4">
                    <div class="font-semibold text-sky-500 text-lg">
                        Código:
                    </div>
                    <div class="font-semibold text-sky-700 text-lg">
                        {{ product.code }}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Toast position="bottom-right"/>
</template>