<script setup>
import router from '@/app/router';
import { useCartStore } from '@/contexts/catalog/stores/cart';
import { useAuthStore } from '@/contexts/identity/stores/auth';
import { api } from '@/shared/infrastructure/http/api';
import { buildProductItemsByProductId, enrichProduct } from '@/shared/utils/productApiAdapters';
import Button from 'primevue/button';
import { useToast } from 'primevue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const backendUrl = import.meta.env.VITE_BACKEND_BASE

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()
const cart = useCartStore()

const productCode = route.params.code

const isLoading = ref(true)
const isAddingToCart = ref(false)
const product = ref({})

// Format the price of the product (commas)
const formatPrice = (price) => {
    const priceString = String(price ?? '')
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
        await cart.initializeForSession()

        const [productResponse, productItemsResponse] = await Promise.all([
            api.get(`products/${productCode}`),
            api.get('product-items')
        ])
        const productItemsByProductId = buildProductItemsByProductId(productItemsResponse.data)
        product.value = enrichProduct(productResponse.data, productItemsByProductId)

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

const addToCart = async () => {
    if (!auth.isAuthenticated) {
        toast.add({
            severity: 'warn',
            summary: 'Inicia sesión',
            detail: 'Debes iniciar sesión para agregar productos al carrito.',
            life: 4000
        })
        router.push({ name: 'login' })
        return
    }

    if (!product.value?.product_item_id) {
        toast.add({
            severity: 'error',
            summary: 'No disponible',
            detail: 'Este producto no tiene item de inventario asociado para carrito.',
            life: 4500
        })
        return
    }

    try {
        isAddingToCart.value = true

        await cart.addProduct(product.value, 1)

        toast.add({
            severity: 'success',
            summary: 'Agregado',
            detail: 'Producto agregado al carrito.',
            life: 3000
        })
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.message ?? 'No se pudo agregar el producto al carrito.',
            life: 4500
        })
    } finally {
        isAddingToCart.value = false
    }
}
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
                    <div v-if="product.price !== null" class="font-bold text-2xl text-sky-600">
                        {{ '$' + formatPrice(product.price) }}
                    </div>
                    <div v-else class="font-semibold text-lg text-slate-500">
                        Precio no disponible
                    </div>

                    <!-- Product code -->
                    <div class="flex flex-row gap-x-2">
                        <div class="font-semibold text-sky-800">
                            Codigo:
                        </div>
                        <div class="font-semibold text-sky-600">
                            {{ product.code }}
                        </div>
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
    
                    <div class="font-semibold text-slate-500">
                        Disponibilidad no visible en esta version.
                    </div>

                    <Button
                        label="Agregar al carrito"
                        icon="pi pi-shopping-cart"
                        class="!bg-sky-700 !border-sky-700 hover:!bg-sky-800 hover:!border-sky-800 mt-3"
                        :loading="isAddingToCart"
                        :disabled="!product?.product_item_id"
                        @click="addToCart"
                    />
                </div>
            </div>
        </div>
    </div>

    <Toast position="bottom-right"/>
</template>
