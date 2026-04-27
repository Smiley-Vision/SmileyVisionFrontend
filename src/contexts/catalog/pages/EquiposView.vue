<script setup>
import { api } from '@/shared/infrastructure/http/api';
import { buildProductItemsByProductId, enrichProducts, normalizeProductListPayload } from '@/shared/utils/productApiAdapters';
import { useToast } from 'primevue';
import { ref } from 'vue';
import { onMounted } from 'vue';

const backendUrl = import.meta.env.VITE_BACKEND_BASE

const toast = useToast()

const isLoading = ref(true)
const equipos = ref([])

// Retrieve all the 'Equipos' labeled products
onMounted(async () => {
    try {
        const [productsResponse, productItemsResponse] = await Promise.all([
            api.get('products/equipos'),
            api.get('product-items')
        ])
        const productItemsByProductId = buildProductItemsByProductId(productItemsResponse.data)
        const products = normalizeProductListPayload(productsResponse.data)

        equipos.value = enrichProducts(products, productItemsByProductId)
        isLoading.value = false
        
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron obtener los equipos',
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

    <!-- Content -->
    <div v-else class="flex flex-col xl:px-20 md:px-12 px-8 px-14 lg:mt-14 lg:py-0 md:py-10 py-8 lg:gap-y-16 gap-y-12">
        <!-- Descriptive title and search bar -->
        <div class="flex lg:flex-row flex-col items-center center lg:gap-y-0 gap-y-8 justify-between">
            <div class="lg:text-4xl text-3xl font-semibold text-sky-800">
                Catálogo de equipos
            </div>
            <RouterLink :to="{ name: 'shop-search-Equipos' }" class="flex lg:w-auto w-full bg-sky-200 hover:bg-sky-300 text-sky-800 px-6 py-3 rounded-xl shadow-xl">
                <div class="flex flex-row items-center gap-x-4">
                    <div class="pi pi-search font-semibold"></div>
                    <div class="font-semibold">Buscar</div>
                </div>
            </RouterLink>
        </div>
        
        <!-- Product grid (list, on phone) -->
        <div class="flex justify-center">
            <div class="grid xl:grid-cols-4 sm:grid-cols-3 grid-cols-2 lg:gap-x-12 gap-x-8 lg:gap-y-10 gap-y-8 text-center">
                <div v-for="(equipo, index) in equipos" :key="index">
                    <div class="flex flex-col items-center gap-y-4">
                        <RouterLink :to="{ name: 'product', params: { code: equipo.id } }" :productID="equipo.id">
                            <img
                                :src="`${backendUrl}/storage/${equipo.image_url}`"
                                class="lg:size-60 md:size-40 size-32 border-solid border-4 border-sky-600 rounded-xl shadow-lg
                                        hover:shadow-2xl transform transition duration-200 hover:scale-105"
                            >
                        </RouterLink>
                        <div class="font-semibold lg:text-lg sm:text-sm text-xs text-sky-800">
                            {{ equipo.name }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Toast position="bottom-right"/>
</template>
