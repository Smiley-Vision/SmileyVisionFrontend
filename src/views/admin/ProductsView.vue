<script setup>

const options = ['Añadir producto', 'Editar producto', 'Manejar disponibilidad']
const images = ['create', 'modify', 'availability']

</script>

<template>
    <div class="flex flex-col lg:px-20 px-14 mt-14 lg:gap-y-16 gap-y-10 2xl:mb-0 mb-12">
        <!-- Title and description -->
        <div
            class="flex flex-col gap-y-8">
            <div class="md:text-6xl text-4xl font-semibold text-sky-800 -mb-4">
                Administración de productos
            </div>
            <div class="text-lg font-medium text-sky-800">
                Elija la acción que desea realizar sobre los productos.
            </div>
        </div>

        <!-- Content -->
        <div class="flex lg:flex-row lg:gap-x-36 flex-col gap-y-16 max-w-full mx-auto my-auto p-4">
            <div v-for="(image, index) in images" :key="index" class="min-w-2xl rounded-xl">
                <div class="flex flex-col items-center gap-y-4 max-w-sm max-h-sm">
                    <RouterLink :to="{ name: `admin-products-${image}` }">
                        <img
                            :src="`/src/assets/images/admin/products/admin-products-${image}.png`"
                            class="size-60 border-solid border-4 border-sky-600 rounded-xl shadow-lg p-6
                                    hover:shadow-2xl transform transition duration-200 hover:scale-105"
                        >
                    </RouterLink>
                    <div class="font-semibold text-2xl text-sky-800">{{ options[index] }}</div>
                </div>
            </div>
        </div>
    </div>
</template>