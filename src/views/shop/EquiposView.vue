<script setup>
import { fetchData } from '@/utils/api';
import { ref } from 'vue';
import { onMounted } from 'vue';

const isLoading = ref(true)
const equipos = ref([])

// Retrieve all the 'Equipos' labeled products
onMounted(async () => {
    try {
        const response = await fetchData('equipos', 'GET')

        if (response) {
            isLoading.value = false
            equipos.value = response
        }
        
    } catch (error) {
        throw error
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
        <div class="flex flex-col gap-y-8">
            <div class="md:text-6xl text-4xl font-semibold text-sky-800 -mb-4">
                Equipos ópticos
            </div>
            <div class="text-lg font-medium text-sky-800">
                Explore el catálogo de productos
            </div>
        </div>
        
        <!-- Product grid (list, on phone) -->
        <div class="flex justify-center">
            <div class="lg:grid lg:grid-cols-3 lg:gap-x-12 flex-col">
                <div
                    v-for="(equipo, index) in equipos" :key="index"
                    class="bg-sky-300 rounded-xl shadow-xl">
                    {{ equipo.name }}
                </div>
            </div>
        </div>
    </div>
</template>