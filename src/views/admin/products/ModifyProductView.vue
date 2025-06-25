<script setup>
import { fetchData } from '@/utils/api';
import { onMounted } from 'vue';
import { ref } from 'vue';

const searchQuery = ref('')
const productTypes = ref([])
const selectedType = ref(0)
const products = ref([])

const isLoading = ref(false)

// Fetch products with the search query
const fetchFilteredProducts = async () => {
    try {
        isLoading.value = true
        const response = await fetchData(`products/query/${searchQuery.value}`, 'GET')

        isLoading.value = false
        products.value = response.products
        
    } catch (error) {
        throw error
    }
}

// Fetch the product types
onMounted(async () => {
    try {
        const response = await fetchData('product-types', 'GET')
        productTypes.value = response   
    } catch (error) {
        throw error
    }
})
</script>

<template>
    <div class="flex flex-col lg:px-20 px-14 mt-14 lg:gap-y-10 gap-y-10 2xl:mb-0 mb-12">
        <!-- Descriptive title -->
        <div class="text-3xl font-semibold text-sky-800">
            Busque un producto para editar
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
                name="type"
                id="type"
                :class="[
                    'lg:w-1/3 w-full p-2 border border-2 border-solid border-slate-300 rounded-xl',
                    selectedType === 0 ? 'text-slate-400' : 'text-black'
                ]"
                >
                <option disabled hidden value="0">Elegir categoría (opcional)</option>
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

        <!-- Content -->
        <div v-else class="lg:grid lg:grid-cols-4 flex flex-col gap-4 pt-4">
            <div v-for="product in products" class="font-semibold text-xl text-sky-700">
                {{ product.name }}
            </div>
        </div>
    </div>
</template>