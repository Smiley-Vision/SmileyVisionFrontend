<script setup>
import Button from '@/components/Button.vue';
</script>

<template>
    <!-- Contact view container -->
    <div class="flex flex-col px-20 mt-14 gap-16 2xl:mb-0 mb-12">

        <!-- Title and subtitle -->
        <div class="flex flex-col gap-8">
            <div class="md:text-6xl text-4xl font-semibold text-sky-800 -mb-4">
                Contáctanos
            </div>
            <div class="flex flex-col gap-1">
                <div class="text-lg font-medium text-sky-800">
                    Estamos aquí para ayudarte. Horarios de atención:
                </div>
                <div class="text-lg font-medium text-sky-800">
                    • Lunes a viernes de 9:00 a.m. - 7:00 p.m.
                </div>
                <div class="text-lg font-medium text-sky-800">
                    • Sábados de 9:00 a.m. - 4:00 p.m.
                </div>
            </div>
        </div>

        <!-- Phone, chat and e-mail sub-containers -->
        <div class="flex lg:flex-row flex-col lg:gap-8 gap-16">
            <div class="flex-1 flex flex-col gap-4 bg-gray-300 rounded-xl shadow-lg px-8 py-4 relative">
                <!-- Icon -->
                <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-sky-600 rounded-full flex items-center justify-center shadow-md">
                    <i class="pi pi-phone text-white text-4xl"></i> <!-- Example icon -->
                </div>
                <!-- Content -->
                <div class="text-2xl font-semibold mt-8 mb-4">
                    Teléfono
                </div>
                <div class="text-lg text-justify font-normal mb-2">
                    Podemos atenderte dentro de los horarios establecidos
                    (que se muestran abajo en la página).
                </div>
                <div class="flex flex-col items-center">
                    <Button :width="8" text="Llamar" to="https://google.com"></Button>
                </div>
            </div>
            <div class="flex-1 flex flex-col gap-4 bg-gray-300 rounded-xl shadow-lg px-8 py-4 relative">
                <!-- Icon -->
                <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-sky-600 rounded-full flex items-center justify-center shadow-md">
                    <i class="pi pi-whatsapp text-white text-4xl"></i> <!-- Example icon -->
                </div>
                <!-- Content -->
                <div class="text-2xl font-semibold mt-8 mb-4">
                    WhatsApp
                </div>
                <div class="text-lg text-justify font-normal mb-2">
                    Puedes dejarnos un mensaje en cualquier momento, y te
                    responderemos en alguna de nuestras horas hábiles.
                </div>
                <div class="flex flex-col items-center">
                    <Button :width="8" text="Llamar" to="https://google.com"></Button>
                </div>
            </div>
            <div class="flex-1 flex flex-col gap-4 bg-gray-300 rounded-xl shadow-lg px-8 py-4 relative">
                <!-- Icon -->
                <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-sky-600 rounded-full flex items-center justify-center shadow-md">
                    <i class="pi pi-envelope text-white text-4xl"></i> <!-- Example icon -->
                </div>
                <!-- Content -->
                <div class="text-2xl font-semibold mt-8 mb-4">
                    Correo
                </div>
                <div class="text-lg text-justify font-normal mb-2">
                    Mándanos un correo en cualquier momento, y nuestro servicio
                    de atención al cliente te dejará una respuesta.
                </div>
                <div class="flex flex-col items-center">
                    <Button :width="8" text="Llamar" to="https://google.com"></Button>
                </div>
            </div>
        </div>
    </div>
</template>