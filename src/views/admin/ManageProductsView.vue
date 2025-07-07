<script setup>

const options = ['Añadir', 'Editar', 'Disponibilidad']
const images = ['create', 'modify', 'availability']

</script>

<template>
    <div class="flex flex-col lg:px-20 md:px-12 px-8 mt-14 lg:gap-y-16 gap-y-10 2xl:mb-0 mb-12">
        <!-- Title and description -->
        <div
            class="flex flex-col gap-y-8">
            <div class="xl:text-6xl md:text-5xl text-4xl font-semibold text-sky-800 -mb-4">
                Administración de productos
            </div>
            <div class="text-lg font-medium text-sky-800">
                Elija la acción que desea realizar sobre los productos.
            </div>
        </div>

        <!-- Content -->
        <div class="flex md:flex-row xl:gap-x-36 lg:gap-x-22 md:gap-x-20 flex-col gap-y-12 max-w-full mx-auto my-auto p-4">
            <div v-for="(image, index) in images" :key="index" class="min-w-2xl rounded-xl">
                <div class="flex flex-col items-center gap-y-4 max-w-sm max-h-sm">
                    <RouterLink :to="{ name: `admin-products-${image}` }">
                        <img
                            :src="`/src/assets/images/admin/products/admin-products-${image}.png`"
                            class="lg:size-52 size-36 border-solid border-4 border-sky-600 rounded-xl shadow-lg p-6
                                    hover:shadow-2xl transform transition duration-200 hover:scale-105"
                        >
                    </RouterLink>
                    <div class="font-semibold items-center lg:text-3xl md:text-2xl text-xl text-sky-800 text-center">{{ options[index] }}</div>
                </div>
            </div>
        </div>
    </div>
</template>