<script setup>
import glassesModel from '@/assets/models/glasses.glb';
import logoImage from '@/assets/images/smiley_logo.png';
import { onMounted, ref } from 'vue';

defineEmits(['scroll-to'])

const isModelAvailable = ref(false)
const hasChecked3d = ref(false)

function supportsWebGL() {
    try {
        const canvas = document.createElement('canvas')
        return Boolean(
            canvas.getContext('webgl2') ||
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl')
        )
    } catch {
        return false
    }
}

onMounted(async () => {
    if (!supportsWebGL()) {
        hasChecked3d.value = true
        return
    }

    await import('@google/model-viewer')
    isModelAvailable.value = true
    hasChecked3d.value = true
})
</script>

<template>
    <section id="hero" class="px-6 pt-8 sm:px-8 lg:px-20">
        <div class="mx-auto max-w-7xl">
            <div class="relative overflow-hidden px-0 py-8 sm:px-2 sm:py-12 lg:px-4 lg:py-14">
                <div class="pointer-events-none absolute inset-x-0 top-10 z-0 hidden leading-none sm:block">
                    <span class="hero-word hero-word--smiley hero-word--animated absolute left-0 top-0 text-left text-[clamp(5rem,14vw,11rem)] font-extrabold uppercase tracking-[0.04em]">
                        Smiley
                    </span>
                    <span class="hero-word hero-word--vision hero-word--animated hero-word--animated-delayed absolute right-0 top-[7.5rem] text-right text-[clamp(4.8rem,13vw,10.5rem)] font-extrabold uppercase tracking-[0.03em] lg:top-[8.5rem]">
                        Vision
                    </span>
                </div>

                <div class="relative z-10 flex flex-col items-center gap-8 pt-6 sm:pt-16 lg:pt-20">
                    <div class="pointer-events-none mb-2 flex w-full flex-col leading-none sm:hidden">
                        <span class="hero-word hero-word--smiley hero-word--animated text-left text-[clamp(4rem,18vw,6rem)] font-extrabold uppercase tracking-[0.04em]">
                            Smiley
                        </span>
                        <span class="hero-word hero-word--vision hero-word--animated hero-word--animated-delayed -mt-2 self-end text-right text-[clamp(4rem,17vw,5.8rem)] font-extrabold uppercase tracking-[0.04em]">
                            Vision
                        </span>
                    </div>

                    <div
                        v-reveal="{ origin: 'zoom', scale: 0.9, duration: 900 }"
                        class="hero-model-wrap relative h-[300px] w-full sm:h-[180px] lg:h-[220px]"
                    >
                        <model-viewer
                            v-if="isModelAvailable"
                            :src="glassesModel"
                            auto-rotate
                            alt="Modelo 3D de lentes Smiley Vision"
                            rotation-per-second="18deg"
                            interaction-prompt="none"
                            disable-pan
                            disable-zoom
                            shadow-intensity="0"
                            exposure="1.05"
                            camera-target="0m 0m 0m"
                            camera-orbit="0deg 90deg 3.8m"
                            min-camera-orbit="0deg 90deg 10m"
                            max-camera-orbit="0deg 90deg 10m"
                            field-of-view="18deg"
                            style="background-color: transparent;"
                            class="hero-model absolute left-[50%] top-[30%] h-full w-full -translate-x-1/2 -translate-y-1/2"
                        />
                        <div
                            v-else
                            class="absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                        >
                            <div
                                v-if="!hasChecked3d"
                                class="h-14 w-14 rounded-full border-4 border-sky-100 border-t-sky-600 animate-spin"
                                aria-label="Cargando visor 3D"
                            ></div>
                            <div v-else class="flex flex-col items-center gap-4 text-center">
                                <img :src="logoImage" alt="Smiley Vision" class="h-24 w-24 object-contain sm:h-28 sm:w-28">
                                <p class="max-w-xs text-sm font-medium text-sky-700 sm:text-base">
                                    Vista 3D disponible en navegadores compatibles con WebGL.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        v-reveal="{ origin: 'up', distance: 28, duration: 760, delay: 120 }"
                        class="max-w-3xl text-center"
                    >
                        <h1 class="text-4xl font-bold tracking-tight text-sky-800 sm:text-5xl lg:text-6xl">
                            SOMOS DISTRIBUIDORES
                        </h1>
                        <p class="mt-4 text-lg font-medium text-sky-700 sm:text-3xl">
                            Tenemos lo mejor para tu óptica
                        </p>
                    </div>

                    <div
                        v-reveal="{ origin: 'up', distance: 24, duration: 720, delay: 220 }"
                        class="flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:justify-center"
                    >
                        <button
                            type="button"
                            class="rounded-full bg-sky-700 px-7 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-800"
                            @click="$emit('scroll-to', 'store')"
                        >
                            Ver catálogo
                        </button>
                        <button
                            type="button"
                            class="rounded-full border border-sky-200 bg-white px-7 py-3 text-base font-bold text-sky-700 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50"
                            @click="$emit('scroll-to', 'registration')"
                        >
                            Registrarme
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hero-word {
    color: transparent;
    background-clip: text;
    -webkit-background-clip: text;
}

.hero-word--smiley {
    background-image: linear-gradient(180deg, #075985 0%, #ffffff 90%);
}

.hero-word--vision {
    background-image: linear-gradient(180deg, #ffffff 0%, #075985 90%);
}

.hero-word--animated {
    animation: heroWordFloat 7s ease-in-out infinite;
    transform-origin: center;
}

.hero-word--animated-delayed {
    animation-delay: 0.8s;
}

.hero-model-wrap {
    overflow: visible;
}

.hero-model {
    max-width: 100%;
    object-position: center;
}

@keyframes heroWordFloat {
    0%,
    100% {
        transform: translate3d(0, 0, 0);
        opacity: 0.96;
    }
    50% {
        transform: translate3d(0, -8px, 0);
        opacity: 1;
    }
}
</style>
