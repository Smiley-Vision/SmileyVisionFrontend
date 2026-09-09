<script setup lang="ts">
interface ContactChannel {
  icon: string
  title: string
  description: string
  href: string
  linkLabel: string
  buttonLabel: string
  external: boolean
}

const channels: ContactChannel[] = [
  {
    icon: 'pi pi-facebook',
    title: 'Facebook',
    description: 'Síguenos para novedades, promociones y catálogo',
    href: 'https://www.facebook.com/ANDREMUNDOVISION/',
    linkLabel: 'ANDREMUNDOVISION',
    buttonLabel: 'Visitar página',
    external: true,
  },
  {
    icon: 'pi pi-whatsapp',
    title: 'WhatsApp',
    description: 'Escríbenos directamente y te responderemos a la brevedad',
    href: 'https://wa.me/5215521285764',
    linkLabel: '+52 1 55 2128 5764',
    buttonLabel: 'Enviar mensaje',
    external: true,
  },
  {
    icon: 'pi pi-envelope',
    title: 'Correo electrónico',
    description: 'Resolvemos tus dudas y cotizaciones por correo',
    href: 'mailto:contacto.sv@gmail.com',
    linkLabel: 'contacto.sv@gmail.com',
    buttonLabel: 'Escribir correo',
    external: false,
  },
]
</script>

<template>
  <div class="px-6 pb-24 pt-16 sm:px-8 lg:px-20">
    <div class="mx-auto max-w-6xl">
      <div
        v-reveal="{ origin: 'up', distance: 28, duration: 700 }"
        class="mx-auto max-w-xl text-center"
      >
        <div
          class="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-sky-600"
        >
          <i class="pi pi-envelope"></i>
          <span>Contacto</span>
        </div>
        <h1 class="mt-3 text-4xl font-bold tracking-tight text-sky-800 sm:text-5xl">
          Estamos para ayudarte
        </h1>
        <p class="mt-4 text-lg font-medium leading-8 text-slate-600">
          Elige el canal que prefieras para comunicarte con nuestro equipo.
        </p>
      </div>

      <div
        v-reveal="{ origin: 'up', distance: 24, duration: 720, delay: 120 }"
        class="mt-12 flex justify-center"
      >
        <div
          class="flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-slate-100 px-8 py-5"
        >
          <span
            class="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-sky-100 text-lg text-sky-800"
          >
            <i class="pi pi-clock"></i>
          </span>
          <div class="text-left">
            <p class="font-bold text-sky-800">Horario de atención (hora del centro de México)</p>
            <p class="text-sm text-slate-700">
              Lunes a viernes: 9:00 a.m. – 7:00 p.m. &nbsp;·&nbsp; Sábados: 9:00 a.m. – 4:00 p.m.
            </p>
          </div>
        </div>
      </div>

      <div class="mt-16 grid gap-8 sm:mx-auto sm:max-w-md md:mx-0 md:max-w-none md:grid-cols-3">
        <article
          v-for="(channel, index) in channels"
          :key="channel.title"
          v-reveal="{ origin: 'up', distance: 28, duration: 680, delay: index * 90 + 40 }"
          class="relative pt-11"
        >
          <div
            class="absolute left-1/2 top-0 z-10 flex h-[88px] w-[88px] -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-sky-700 text-3xl text-white shadow-[0_10px_24px_rgba(7,89,133,0.35)]"
          >
            <i :class="channel.icon"></i>
          </div>
          <div
            class="contact-card flex h-full flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 pb-8 pt-14 text-center shadow-sm"
          >
            <h3 class="text-xl font-bold text-sky-800">{{ channel.title }}</h3>
            <p class="text-sm leading-7 text-slate-600">{{ channel.description }}</p>
            <a
              :href="channel.href"
              :target="channel.external ? '_blank' : undefined"
              :rel="channel.external ? 'noopener noreferrer' : undefined"
              class="mt-1 font-bold text-sky-700 hover:text-sky-800 hover:underline"
            >
              {{ channel.linkLabel }}
            </a>
            <a
              :href="channel.href"
              :target="channel.external ? '_blank' : undefined"
              :rel="channel.external ? 'noopener noreferrer' : undefined"
              class="mt-4 flex items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-2 text-sm font-bold text-sky-700 transition hover:border-sky-300 hover:bg-sky-50"
            >
              <i :class="channel.icon"></i>
              {{ channel.buttonLabel }}
            </a>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-card {
  transition:
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.14);
}
</style>
