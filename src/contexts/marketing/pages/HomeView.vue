<script setup>
import Button from '@/shared/ui/components/Button.vue';
import { useAuthStore } from '@/contexts/identity/stores/auth';
import { useToast } from 'primevue';
import { nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()
const user = auth.user

onMounted(async () => {
    await nextTick() // Let Toast render first

    if (route.query.justLoggedIn === 'true') {
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Bienvenido, ${user.name}`,
            life: 4000
        })

        auth.justLoggedIn = false

    } else if (route.query.justSubmittedRequest === 'true') {
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Solicitud enviada correctamente',
            life: 4000
        })

        auth.justSubmittedRequest = false
    }
})
</script>

<template>
    <!-- Home view container -->
    <div class="flex lg:flex-row flex-col items-center xl:px-20 md:px-12 px-8 lg:mt-14 lg:py-0 md:py-10 py-8 lg:gap-28 gap-10">

        <!-- Left sub-container -->
        <div>

            <!-- Title and subtitle -->
            <div class="flex flex-col gap-y-4 mb-8">
                <div class="xl:text-8xl lg:text-6xl text-4xl font-semibold text-sky-800">
                    Somos Distribuidores
                </div>
                <div class="lg:text-4xl md:text-2xl text-xl font-normal text-sky-800">
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
                <div class="flex sm:flex-row flex-col gap-6 p-4 mx-auto">
                    <Button to="/shop" :is-hollow="false" :width="12" text="Ver productos"></Button>
                    <Button to="/contact" :is-hollow="true" :width="12" text="Contáctanos"></Button>
                </div>
            </div>
        </div>

        <!-- Right sub-container -->
        <div class="size-2/3">
            <img src="@/assets/images/home_image.jpeg" alt="home_image">
        </div>
    </div>

    <Toast position="top-left"/>
</template>