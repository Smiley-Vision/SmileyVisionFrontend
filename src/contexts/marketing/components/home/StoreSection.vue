<script setup>
import SectionHeading from './SectionHeading.vue';

const backendUrl = import.meta.env.VITE_BACKEND_BASE
const categories = [
    {
        title: 'Micas',
        routeName: 'shop-Micas',
        image: `${backendUrl}/storage/shop/0.jpg`,
        alt: 'Ilustración de micas'
    },
    {
        title: 'Armazones',
        routeName: 'shop-Armazones',
        image: `${backendUrl}/storage/shop/1.jpg`,
        alt: 'Ilustración de armazones'
    },
    {
        title: 'Equipos',
        routeName: 'shop-Equipos',
        image: `${backendUrl}/storage/shop/2.jpg`,
        alt: 'Ilustración de equipos ópticos'
    }
]
</script>

<template>
    <section id="store" class="scroll-mt-32 px-6 py-16 sm:px-8 lg:px-20">
        <div class="mx-auto max-w-7xl">
            <SectionHeading
                title="Nuestra tienda"
                description="Tenemos una gran gama de productos para óptica con un alto enfoque a las necesidades del cliente."
            />

            <div class="mt-12 grid gap-6 md:grid-cols-3">
                <RouterLink
                    v-for="(category, index) in categories"
                    :key="category.title"
                    :to="{ name: category.routeName }"
                    v-reveal="{ origin: 'up', distance: 34, duration: 720, delay: (index * 110) + 60 }"
                    class="group overflow-hidden p-2 transition duration-300 hover:-translate-y-1"
                >
                    <div class="flex h-48 items-center justify-center p-6">
                        <img :src="category.image" :alt="category.alt" class="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105">
                    </div>
                    <div class="mt-4 flex items-center justify-center gap-3">
                        <h3 class="text-2xl font-bold text-sky-800">
                            {{ category.title }}
                        </h3>
                    </div>
                </RouterLink>
            </div>
        </div>
    </section>
</template>
