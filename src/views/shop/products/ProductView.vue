<script setup>
import { fetchData } from '@/utils/api';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

// ID of the current product
const productID = route.params.id

const isLoading = ref(true)
const product = ref({})

// Get the product associated with the ID
onMounted(async () => {
    try {
        const response = await fetchData(`products/${productID}`, 'GET')
        
        isLoading.value = false
        product.value = response

        console.log(product.value);
        
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

    <div v-else class="text-xl font-semibold">
        This is the view for the product {{ product.name }}
    </div>
</template>