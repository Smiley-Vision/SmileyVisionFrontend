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

// Format the price of the product (commas)
const formatPrice = (price) => {
    const priceString = price.toString()
    const priceDigits = priceString.length
    const commas = Math.floor(priceDigits / 3)
    let commaPosition = priceDigits % 3;

    let priceArray = []
    let commasUsed = 0

    for (let i = 0; i < priceDigits + commas; i++) {
        if (i == commaPosition && i != 0) {
            priceArray.push(',')
            commaPosition += 4
            commasUsed++
        } else {
            priceArray.push(price.toString().charAt(i - commasUsed))
        }
    }

    return priceArray.join('')
}

// Get the product associated with the ID
onMounted(async () => {
    try {
        const response = await fetchData(`products/${productID}`, 'GET')
        
        isLoading.value = false
        product.value = response
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
    <div v-else class="flex flex-col lg:px-20 px-14 mt-14 lg:gap-y-8 gap-y-6 2xl:mb-8 mb-12">

        <!-- Product details text -->
        <div class="font-semibold text-2xl text-sky-700">
            Detalles del producto
        </div>

        <!-- Product image and details -->
        <div class="flex lg:flex-row flex-col justify-center lg:gap-x-10 gap-y-4">
            
            <!-- Product image -->
            <img
                :src="`/src/assets/images/shop/products/equipos/${product.code}.jpeg`"
                alt="Imagen del producto"
                class="lg:size-[28rem]"
            >

            <!-- Product details -->
            <div class="flex flex-col justify-center gap-y-4">

                <!-- Product name -->
                <div class="font-semibold text-xl text-sky-800">
                    {{ product.name }}
                </div>

                <!-- Product price -->
                <div class="font-bold text-2xl text-sky-600">
                    {{ '$' + formatPrice(product.price) }}
                </div>

                <!-- Description -->
                <div class="flex flex-col gap-y-2">
                    <div class="font-semibold text-lg text-sky-800">
                        Descripción
                    </div>
                    <div class="text-justify font-medium text-sky-800 max-w-md">
                        {{ product.description }}
                    </div>
                </div>

                <!-- Products in existence -->
                <div class="flex flex-row gap-x-4">
                    <div class="font-semibold text-sky-800">
                        En existencia:
                    </div>
                    <div class="font-bold text-sky-600">
                        10
                    </div>
                </div>

                <!-- 'Add to cart' button -->
                <button class="bg-sky-600 text-white px-3 py-1 rounded-md hover:bg-sky-700">Añadir al carrito</button>
            </div>
        </div>
    </div>
</template>