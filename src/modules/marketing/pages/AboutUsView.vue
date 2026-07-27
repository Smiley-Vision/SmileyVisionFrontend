<script setup lang="ts">
import aboutImpactImage from '@/assets/images/home_image.jpeg'
import BranchesMap from '@/modules/marketing/components/home/BranchesMap.vue'
import SectionHeading from '@/modules/marketing/components/home/SectionHeading.vue'

interface TimelineItem {
  icon: string
  eyebrow: string
  title: string
  description: string
}

const timeline: TimelineItem[] = [
  {
    icon: 'pi pi-flag',
    eyebrow: '2016 · Mérida, Yucatán',
    title: 'Nuestros orígenes',
    description:
      'Smiley Vision nace en Mérida con una misión clara: acercar a las ópticas de la región productos de alta calidad y un servicio cercano.',
  },
  {
    icon: 'pi pi-map-marker',
    eyebrow: 'Expansión regional',
    title: 'Campeche y Ciudad de México',
    description:
      'A partir de nuestros primeros años, extendimos nuestra operación a Campeche y a la Ciudad de México, ampliando nuestra cobertura a más ópticas del país.',
  },
  {
    icon: 'pi pi-globe',
    eyebrow: 'Próximo paso',
    title: 'Expansión internacional',
    description:
      'Con esa misma visión de crecimiento, hoy trabajamos en establecer a Smiley Vision como distribuidor también fuera de México.',
  },
]

interface ImpactPoint {
  icon: string
  title: string
  description: string
}

const impactPoints: ImpactPoint[] = [
  {
    icon: 'pi pi-heart',
    title: 'Salud visual para más personas',
    description: 'Productos de calidad que ayudan a las ópticas a atender mejor a sus clientes.',
  },
  {
    icon: 'pi pi-verified',
    title: 'Estándares más altos',
    description: 'Impulsamos a las ópticas de la región a ofrecer un servicio de mayor calidad.',
  },
  {
    icon: 'pi pi-users',
    title: 'Cercanía con nuestros clientes',
    description:
      'Asesoría profesional y soporte constante para cada óptica que confía en nosotros.',
  },
]
</script>

<template>
  <div class="pb-8 pt-4 md:pb-12">
    <section
      class="bg-gradient-to-b from-sky-50 to-white px-6 pb-12 pt-16 text-center sm:px-8 lg:px-20"
    >
      <div v-reveal="{ origin: 'up', distance: 28, duration: 700 }" class="mx-auto max-w-3xl">
        <p class="text-sm font-bold uppercase tracking-wide text-sky-600">Desde 2016</p>
        <h1 class="mt-3 text-4xl font-bold tracking-tight text-sky-800 sm:text-5xl lg:text-6xl">
          Sobre nosotros
        </h1>
        <p class="mt-5 text-base font-medium leading-8 text-slate-600 sm:text-lg">
          Somos distribuidores especializados en productos ópticos, comprometidos con elevar la
          calidad y la salud visual en cada óptica a la que llegamos.
        </p>
      </div>
    </section>

    <section class="px-6 py-16 sm:px-8 lg:px-20">
      <div class="mx-auto max-w-7xl">
        <SectionHeading
          title="Nuestra trayectoria"
          description="De una óptica local en Yucatán a un distribuidor con presencia en el sureste mexicano."
        />

        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <article
            v-for="(item, index) in timeline"
            :key="item.title"
            v-reveal="{ origin: 'up', distance: 28, duration: 680, delay: index * 90 + 40 }"
            class="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
          >
            <div
              class="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-2xl text-sky-700"
            >
              <i :class="item.icon"></i>
            </div>
            <p class="mt-4 text-sm font-bold uppercase tracking-wide text-sky-600">
              {{ item.eyebrow }}
            </p>
            <h3 class="mt-2 text-xl font-bold text-sky-800">{{ item.title }}</h3>
            <p class="mt-3 leading-7 text-slate-600">{{ item.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="bg-slate-100 px-6 py-16 sm:px-8 lg:px-20">
      <div class="mx-auto max-w-7xl">
        <SectionHeading
          title="Presencia en el territorio nacional"
          description="Hoy tenemos operación en Yucatán, Campeche y la Ciudad de México, con planes de seguir creciendo."
        />

        <div
          v-reveal="{ origin: 'up', distance: 42, duration: 820, delay: 120 }"
          class="mt-10 overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-md sm:p-8"
        >
          <BranchesMap />
        </div>
      </div>
    </section>

    <section class="px-6 py-16 sm:px-8 lg:px-20">
      <div class="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div v-reveal="{ origin: 'left', distance: 42, duration: 760 }">
          <h2 class="text-3xl font-bold tracking-tight text-sky-800 sm:text-4xl lg:text-5xl">
            Nuestro impacto en el sector óptico
          </h2>
          <p class="mt-6 text-base font-medium leading-8 text-slate-600 sm:text-lg">
            En cada estado donde tenemos presencia, trabajamos junto a las ópticas para elevar el
            estándar del sector. Al ofrecer productos de la mayor calidad para armazones, micas y
            equipo clínico, ayudamos a que más personas tengan acceso a una mejor salud visual.
          </p>

          <div class="mt-8 flex flex-col gap-5">
            <div v-for="point in impactPoints" :key="point.title" class="flex items-start gap-4">
              <div
                class="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-sky-100 text-lg text-sky-700"
              >
                <i :class="point.icon"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-sky-800">{{ point.title }}</h3>
                <p class="mt-1 text-slate-600">{{ point.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-reveal="{ origin: 'right', distance: 48, duration: 820, delay: 120 }">
          <img
            :src="aboutImpactImage"
            alt="Examen de la vista en óptica"
            class="mx-auto w-full max-w-md rounded-[1.75rem] object-contain shadow-md"
          />
        </div>
      </div>
    </section>
  </div>
</template>
