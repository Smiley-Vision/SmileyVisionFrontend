<script setup>
import { fetchData } from '@/utils/api';
import { useToast } from 'primevue';
import { ref } from 'vue';
import { onMounted } from 'vue';

const backendUrl = import.meta.env.VITE_BACKEND_URL

const toast = useToast()

const isLoading = ref(true)
const armazones = ref([])

// Retrieve all the 'Armazones' labeled products
onMounted(async () => {
    try {
        const response = await fetchData('armazones', 'GET')

        armazones.value = response
        isLoading.value = false
        
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron obtener los armazones',
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
    <div v-else class="flex flex-col lg:px-20 px-14 mt-14 lg:gap-y-16 gap-y-10 2xl:mb-8 mb-12">
        <!-- Descriptive title and search bar -->
        <div class="flex lg:flex-row flex-col items-center lg:gap-y-0 gap-y-8 justify-between">
            <div class="text-3xl font-semibold text-sky-800">
                Catálogo de armazones
            </div>
            <RouterLink :to="{ name: 'shop-search-Armazones' }" class="bg-sky-700 hover:bg-sky-800 text-sky-100 px-6 py-4 rounded-xl shadow-xl">
                <div class="flex flex-row items-center gap-x-4">
                    <div class="pi pi-search font-semibold"></div>
                    <div class="font-semibold">Buscar</div>
                </div>
            </RouterLink>
        </div>
        
        <!-- Product grid (list, on phone) -->
        <div class="flex justify-center">
            <div class="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 lg:gap-x-12 gap-x-8 lg:gap-y-10 gap-y-8 text-center">
                <div v-for="(armazon, index) in armazones" :key="index">
                    <div class="flex flex-col items-center gap-y-4">
                        <RouterLink :to="{ name: 'product', params: { code: armazon.code } }" :productID="armazon.code">
                            <img
                                :src="`${backendUrl}/storage/${armazon.image_url}`"
                                class="lg:size-60 size-40 border-solid border-4 border-sky-600 rounded-xl shadow-lg
                                        hover:shadow-2xl transform transition duration-200 hover:scale-105"
                            >
                        </RouterLink>
                        <div class="font-semibold lg:text-lg text-sm text-sky-800">
                            {{ armazon.name }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Toast position="bottom-right"/>
</template>