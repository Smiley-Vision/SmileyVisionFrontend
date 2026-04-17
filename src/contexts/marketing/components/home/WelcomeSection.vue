<script setup>
import opticalEquipmentImage from '@/assets/images/landing/lensometro.webp';

defineEmits(['scroll-to'])
</script>

<template>
    <section id="welcome" class="scroll-mt-32 px-6 py-16 sm:px-8 lg:px-20">
        <div class="mx-auto grid max-w-7xl items-center gap-10 px-0 py-0 sm:px-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <div v-reveal="{ origin: 'left', distance: 42, duration: 760 }" class="order-2 lg:order-1">
                <h2 class="mt-6 text-3xl font-bold tracking-tight text-sky-800 sm:text-4xl lg:text-5xl">
                    Bienvenidos a Smiley Vision
                </h2>
                <p class="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
                    En Smiley Vision nos preocupamos por la calidad de tu óptica, así como la satisfacción de tus clientes; es por eso que contamos con una gran variedad de productos para tu óptica que serán de un gran atractivo para el público.
                </p>

                <button
                    type="button"
                    class="mt-8 rounded-full bg-sky-700 px-7 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-800"
                    @click="$emit('scroll-to', 'store')"
                >
                    Ver catálogo
                </button>
            </div>

            <div v-reveal="{ origin: 'right', distance: 48, duration: 820, delay: 120 }" class="order-1 lg:order-2">
                <div class="relative overflow-hidden p-0">
                    <img
                        :src="opticalEquipmentImage"
                        alt="Equipo óptico Smiley Vision"
                        class="relative z-10 mx-auto w-full max-w-md object-contain"
                    >
                </div>
            </div>
        </div>
    </section>
</template>
