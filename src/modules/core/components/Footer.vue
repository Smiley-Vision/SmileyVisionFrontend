<script setup lang="ts"></script>

<template>
  <footer class="bg-sky-800 text-white shadow-[0_-18px_50px_rgba(12,94,137,0.18)]">
    <div class="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-20">
      <div class="grid gap-10 lg:grid-cols-3">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <div class="flex h-16 w-16 items-center justify-center">
              <img
                src="@/assets/images/smiley_logo.png"
                alt="Logo Smiley Vision"
                class="h-13 w-13 object-contain"
              />
            </div>
            <div>
              <div class="text-2xl font-semibold">Smiley Vision</div>
              <div class="text-sm text-sky-100">Distribución especializada para ópticas</div>
            </div>
          </div>

          <p class="max-w-sm text-sm leading-7 text-sky-100 sm:text-base">
            Distribuidores de productos ópticos de alta tecnología y calidad para ópticas
          </p>
        </div>

        <div class="flex flex-col">
          <h3 class="text-2xl font-semibold">Redes sociales</h3>
          <a
            href="https://www.facebook.com/ANDREMUNDOVISION/"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center text-sky-50 transition hover:text-white"
          >
            <span
              class="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-xl"
            >
              <i class="pi pi-facebook"></i>
            </span>
            <span>ANDREMUNDOVISION</span>
          </a>
          <a
            href="https://wa.me/529811234567"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center text-sky-50 transition hover:text-white"
          >
            <span
              class="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-xl"
            >
              <i class="pi pi-whatsapp"></i>
            </span>
            <span>+52 1 55 2128 5764</span>
          </a>
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="text-2xl font-semibold">Contacto</h3>
          <a href="mailto:contacto.sv@gmail.com" class="text-sky-50 transition hover:text-white">
            contacto.sv@gmail.com
          </a>
          <a href="tel:+529811234567" class="text-sky-50 transition hover:text-white">
            55 2128 5764
          </a>
          <div class="space-y-1 text-sky-100">
            <p>Lunes a viernes de 9:00 a.m. - 7:00 p.m.</p>
            <p>Sábados de 9:00 a.m. - 4:00 p.m.</p>
          </div>
        </div>
      </div>

      <div
        class="mt-10 border-t border-white/15 pt-6 text-center text-sm text-sky-100 sm:text-base"
      >
        <p>© 2026 Smiley Vision. Todos los derechos reservados</p>
        <div class="mt-3 flex flex-wrap items-center justify-center gap-3">
          <RouterLink :to="{ name: 'home' }" class="transition hover:text-white">
            Aviso de privacidad
          </RouterLink>
          <span class="hidden h-4 w-px bg-white/20 sm:block"></span>
          <RouterLink :to="{ name: 'home' }" class="transition hover:text-white">
            Términos y condiciones
          </RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>
