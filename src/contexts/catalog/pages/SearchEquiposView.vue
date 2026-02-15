<script setup>
import { fetchData } from '@/shared/infrastructure/http/api';
import { useToast } from 'primevue';
import { ref } from 'vue';

const backendUrl = import.meta.env.VITE_BACKEND_URL

const toast = useToast()

const searchQuery = ref('')
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
        const response = await fetchData(`products/query/${searchQuery.value}/3`, 'GET')

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
</script>

<template>
    <div class="flex flex-col xl:px-20 md:px-12 px-8 px-14 lg:mt-14 lg:py-0 md:py-10 py-8 lg:gap-y-16 gap-y-8">
        
        <div class="flex lg:flex-row flex-col justify-between lg:gap-y-0 gap-y-8">
            <!-- Descriptive title -->
            <div class="lg:text-4xl text-3xl font-semibold text-sky-800">
                Buscar equipos ópticos
            </div>
            
            <!-- Search bar -->
            <input
                v-model="searchQuery"
                @input="fetchFilteredProducts"
                placeholder="Buscar por nombre, código o descripción..."
                class="lg:w-2/3 w-full p-2 border border-2 border-solid border-slate-300 rounded-xl"
            >
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
                <RouterLink :to="{ name: 'product', params: { code: product.code } }">
                    <img
                        :src="`${backendUrl}/storage/${product.image_url}`"
                        class="lg:size-60 size-40 border-solid border-2 border-sky-600 rounded-xl shadow-lg
                                hover:shadow-2xl transform transition duration-200 hover:scale-105"
                    >
                </RouterLink>

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