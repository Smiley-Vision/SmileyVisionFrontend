<script setup>
import { fetchData } from '@/utils/api';
import { ref } from 'vue';
import { onMounted } from 'vue';

const isLoading = ref(true)
const products = ref([])

// Retrieve the product type objects
onMounted(async() => {
    const response = await fetchData('product-types', 'GET')

    if (response) {
        products.value = response
        isLoading.value = false
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
    <div v-else class="flex flex-col lg:px-20 px-14 mt-14 lg:gap-y-16 gap-y-10 2xl:mb-0 mb-12">
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
        <div class="flex lg:flex-row lg:gap-x-20 flex-col gap-y-16 max-w-4xl mx-auto my-auto p-4">
            <div v-for="(product, index) in products" :key="index" class="min-w-2xl rounded-xl">
                <RouterLink :to="{ name: 'shop-' + `${product.name}` }">
                    <div class="flex flex-col items-center gap-y-4 max-w-sm max-h-sm">
                        <img
                            :src="`src/assets/images/shop/${index}.jpg`"
                            class="size-60 border-solid border-4 border-sky-600 rounded-xl shadow-lg
                                    hover:shadow-2xl transform transition duration-200 hover:scale-105"
                        >
                        <div class="font-semibold text-2xl text-sky-800">{{ product.name }}</div>
                    </div>
                </RouterLink>
            </div>
        </div>
    </div>
</template>