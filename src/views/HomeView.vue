<script setup>
import Button from '@/components/Button.vue';
</script>

<template>
    <!-- Home view container -->
    <div class="flex lg:flex-row flex-col max-w-full px-20 mt-14 gap-24">

        <!-- Left sub-container -->
        <div class="flex-1">

            <!-- Title and subtitle -->
            <div class="flex flex-col gap-y-4 mb-8">
                <div class="md:text-8xl text-6xl font-semibold text-sky-800">
                    Somos Distribuidores
                </div>
                <div class="md:text-4xl text-3xl font-normal text-sky-800">
                    Tenemos lo mejor para tu óptica
                </div>
            </div>

            <!-- Bar, description and buttons -->
            <div class="flex flex-col gap-y-8">
                <div class="bg-gradient-to-r from-sky-400 to-sky-800 max-w-48 h-2"></div>
                <div class="text-justify font-medium text-sky-800 max-w-xl">
                    En Smiley Vision nos preocupamos por la calidad
                    de tu óptica, así como la satisfacción de tus
                    clientes; es por eso que contamos con una gran
                    variedad de productos para tu óptica que serán
                    de un gran atractivo para el público.
                </div>
                <div class="flex flex-row gap-6 p-4 lg:mx-auto">
                    <Button to="/shop" :is-hollow="false" text="Ver productos"></Button>
                    <Button to="/about" :is-hollow="true" text="Sobre nosotros"></Button>
                </div>
            </div>
        </div>

        <!-- Right sub-container -->
        <div class="flex-1">
            <img src="@/assets/images/home_image.jpeg" alt="home_image" class="w-full h-full object-cover object-left">
        </div>
    </div>
</template>