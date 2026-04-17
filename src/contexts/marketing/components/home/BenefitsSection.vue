<script setup>
import SectionHeading from './SectionHeading.vue';

const benefits = [
    {
        title: 'Calidad Garantizada',
        description: 'Productos de alta calidad garantizada para tu óptica.',
        icon: 'pi pi-verified'
    },
    {
        title: 'Asesoría Profesional',
        description: 'Servicio de asesoría personalizada y soporte técnico.',
        icon: 'pi pi-users'
    },
    {
        title: 'Precios Competitivos',
        description: 'Ofrecemos precios muy competitivos del mercado de óptica.',
        icon: 'pi pi-tags'
    },
    {
        title: 'Entrega Rápida',
        description: 'Envíos rápidos y seguros a tu óptica.',
        icon: 'pi pi-truck'
    }
]
</script>

<template>
    <section id="benefits" class="scroll-mt-32 px-6 py-16 sm:px-8 lg:px-20">
        <div class="mx-auto max-w-7xl px-0 py-0">
            <SectionHeading title="¿Por qué Smiley Vision?" />

            <div class="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <article
                    v-for="(benefit, index) in benefits"
                    :key="benefit.title"
                    v-reveal="{ origin: 'up', distance: 28, duration: 680, delay: (index * 90) + 40 }"
                    class="p-4 text-center"
                >
                    <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-100 text-sky-700 sm:h-28 sm:w-28">
                        <i :class="benefit.icon" style="scale: 2.5;"></i>
                    </div>
                    <h3 class="mt-5 text-2xl font-bold text-sky-800">
                        {{ benefit.title }}
                    </h3>
                    <p class="mt-4 text-base font-medium leading-7 text-slate-600">
                        {{ benefit.description }}
                    </p>
                </article>
            </div>
        </div>
    </section>
</template>
