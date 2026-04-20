<script setup>
import { api } from '@/shared/infrastructure/http/api';
import { getShopRouteNameByCategory, normalizeCategoriesPayload } from '@/shared/utils/productApiAdapters';
import { useToast } from 'primevue';
import { ref } from 'vue';
import { onMounted } from 'vue';

const backendUrl = import.meta.env.VITE_BACKEND_BASE

const toast = useToast()

const isLoading = ref(true)
const products = ref([])

// Retrieve the product type objects
onMounted(async() => {
    try {
        const response = (await api.get('product-categories')).data

        products.value = normalizeCategoriesPayload(response).filter((category) => category.parent_category_id === null)
        isLoading.value = false
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron obtener los productos',
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
    <div v-else class="flex flex-col xl:px-20 md:px-12 px-8 px-14 lg:mt-14 lg:py-0 md:py-10 py-8 gap-y-10 2xl:mb-0 mb-12">
        <!-- Title and description -->
        <div
            class="flex flex-col gap-y-8">
            <div class="md:text-6xl text-4xl font-semibold text-sky-800 -mb-4">
                Tienda
            </div>
            <div class="text-lg font-medium text-sky-800">
                Elija el tipo de producto que desea adquirir.
            </div>
        </div>

        <!-- Product types list -->
        <div class="flex md:flex-row w-full justify-evenly flex-col items-center gap-y-12 mx-auto md:p-4">
            <div v-for="(product, index) in products" :key="index" class="min-w-2xl rounded-xl">
                <div class="flex flex-col items-center gap-y-4 max-w-sm max-h-sm">
                    <RouterLink :to="{ name: getShopRouteNameByCategory(product.name) }">
                        <img
                            :src="`${backendUrl}/storage/shop/${index}.jpg`"
                            class="xl:size-64 size-40 border-solid border-4 border-sky-600 rounded-xl shadow-lg
                                    hover:shadow-2xl transform transition duration-200 hover:scale-105"
                        >
                    </RouterLink>
                    <div class="font-semibold text-2xl text-sky-800">{{ product.name }}</div>
                </div>
            </div>
        </div>
    </div>

    <Toast position="bottom-right"/>
</template>
