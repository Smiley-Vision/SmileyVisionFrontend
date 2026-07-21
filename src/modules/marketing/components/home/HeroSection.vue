<script setup lang="ts">
import { onMounted, ref } from 'vue'

import logoImage from '@/assets/images/smiley_logo.png'
import glassesModel from '@/assets/models/glasses.glb'

defineEmits(['scroll-to'])

const isModelAvailable = ref(false)
const hasChecked3d = ref(false)

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl'),
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
  <section id="hero" class="px-6 sm:px-8 lg:px-20">
    <div class="mx-auto max-w-7xl">
      <div class="relative overflow-hidden px-0 sm:px-2 sm:pb-12 lg:px-4 lg:pb-14">
        <div class="relative z-10 flex flex-col items-center gap-8 sm:pt-8 lg:pt-12">
          <div
            class="hero-showcase pointer-events-none relative flex w-full max-w-6xl items-center justify-center"
            aria-hidden="true"
          >
            <div class="hero-wording flex w-full flex-col leading-none">
              <span
                class="hero-word hero-word--smiley hero-word--animated block text-left text-[clamp(4.25rem,18vw,11rem)] font-extrabold uppercase tracking-[0.04em] sm:text-[clamp(5rem,16vw,11rem)]"
              >
                Smiley
              </span>
              <span
                class="hero-word hero-word--vision hero-word--animated hero-word--animated-delayed mt-2 block self-end text-right text-[clamp(4rem,16vw,10rem)] font-extrabold uppercase tracking-[0.04em] sm:-mt-2 sm:text-[clamp(4.8rem,14vw,10.5rem)]"
              >
                Vision
              </span>
            </div>

            <div
              v-reveal="{ origin: 'zoom', scale: 0.9, duration: 900 }"
              class="hero-model-wrap absolute left-1/2 top-1/2 h-[135px] w-[100%] -translate-x-1/2 -translate-y-1/2 sm:h-[190px] sm:w-[88%] lg:h-[230px] lg:w-[84%]"
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
                camera-orbit="0deg 90deg 4.8m"
                min-camera-orbit="0deg 90deg 14m"
                max-camera-orbit="0deg 90deg 14m"
                field-of-view="14deg"
                style="background-color: transparent"
                class="hero-model hero-model--centered absolute left-1/2 top-1/2 h-full w-full -translate-y-1/2"
              />
              <div
                v-else
                class="absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              >
                <div
                  v-if="!hasChecked3d"
                  class="h-14 w-14 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600"
                  aria-label="Cargando visor 3D"
                ></div>
                <div v-else class="flex flex-col items-center gap-4 text-center">
                  <img
                    :src="logoImage"
                    alt="Smiley Vision"
                    class="h-24 w-24 object-contain sm:h-28 sm:w-28"
                  />
                  <p class="max-w-xs text-sm font-medium text-sky-700 sm:text-base">
                    Vista 3D disponible en navegadores compatibles con WebGL.
                  </p>
                </div>
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
  transform: translate(-50%, -50%);
  overflow: visible;
}

.hero-model {
  max-width: 100%;
  object-position: center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) !important;
}

.hero-model--centered {
  transform: translate3d(-50%, -50%, 0);
}

.hero-showcase {
  min-height: clamp(13rem, 36vw, 24rem);
}

.hero-wording {
  padding-top: clamp(0.5rem, 1vw, 1rem);
  padding-bottom: clamp(0.75rem, 1.5vw, 1.5rem);
}

@media (min-width: 640px) {
  .hero-model--centered {
    transform: translate3d(-57%, -50%, 0);
  }
}

@media (min-width: 1024px) {
  .hero-model--centered {
    transform: translate3d(-55%, -50%, 0);
  }
}

@keyframes heroWordFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 0.96;
  }
  50% {
    transform: translate3d(0, -20px, 0);
    opacity: 1;
  }
}
</style>
