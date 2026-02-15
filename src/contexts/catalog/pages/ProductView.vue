<script setup>
import { fetchData } from '@/shared/infrastructure/http/api';
import { useToast } from 'primevue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const backendUrl = import.meta.env.VITE_BACKEND_URL

const route = useRoute()
const toast = useToast()

const productCode = route.params.code
const productID = ref(0)

const isLoading = ref(true)
const product = ref({})
const productAvailability = ref(0)
const quantity = ref(1)

// Increse the product quantity
const increase = (availability) => {
    if (quantity.value < availability)
        quantity.value++
}

// Decrease the product quantity
const decrease = () => {
  if (quantity.value > 1) quantity.value--;
}

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
        const response = await fetchData(`products/${productCode}`, 'GET')
        product.value = response
        productID.value = response.id

        // Get the availability of the product
        productAvailability.value = await fetchData(`product-existence/${productID.value}`)

        isLoading.value = false
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo obtener el producto',
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
    <div v-else class="flex flex-col items-center lg:px-20 px-14 mt-14 lg:gap-y-8 gap-y-6 2xl:mb-8 mb-12">

        <!-- Grouped left-aligned section -->
        <div class="flex flex-col items-start gap-y-6">

            <!-- Product details text -->
            <div class="font-semibold text-2xl text-sky-700">
                Detalles del producto
            </div>
    
            <!-- Product image and details -->
            <div class="flex lg:flex-row flex-col justify-center lg:gap-x-10 gap-y-4">
                
                <!-- Product image -->
                <img
                    :src="`${backendUrl}/storage/${product.image_url}`"
                    alt="Imagen del producto"
                    class="lg:size-[28rem] border-solid border-2 border-sky-600 rounded-lg shadow-xl"
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
                        <div v-if="productAvailability != 0" class="font-bold text-sky-600">
                            {{ productAvailability }}
                        </div>
                        <div v-else class="font-bold text-gray-400">
                            NO DISPONIBLE
                        </div>
                    </div>
                    
                    <!-- Product quantity selector -->
                    <div v-if="productAvailability != 0" class="flex flex-row gap-x-4">
                        <div class="font-semibold text-sky-800">
                            Cantidad:
                        </div>
                        <div class="flex items-center gap-2">
                            <button @click="decrease"
                                    class="w-8 h-8 rounded bg-sky-600 text-white font-bold hover:bg-sky-700">
                            −
                            </button>
        
                            <input
                                v-model="quantity"
                                min="1"
                                disabled
                                class="w-14 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
        
                            <button @click="increase(productAvailability)"
                                    class="w-8 h-8 rounded bg-sky-600 text-white font-bold hover:bg-sky-700">
                            +
                            </button>
                        </div>
                    </div>
    
                    <!-- 'Add to cart' button -->
                    <button
                        v-if="productAvailability != 0"
                        class="bg-sky-600 text-white px-3 py-1 rounded-md hover:bg-sky-700"
                    >Añadir al carrito</button>
    
                    <button
                        v-else
                        class="bg-gray-400 text-white px-3 py-1 rounded-md disabled"
                        disabled
                    >Añadir al carrito</button>
                </div>
            </div>
        </div>
    </div>

    <Toast position="bottom-right"/>
</template>