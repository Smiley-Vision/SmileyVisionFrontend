<script setup>
import { useRegistrationRequestForm } from '@/contexts/registration/composables/useRegistrationRequestForm';
import { useToast } from 'primevue';
import { computed } from 'vue';
import SectionHeading from './SectionHeading.vue';
import sendImage from '@/assets/images/landing/send.png';

const {
    apiError,
    clearFeedback,
    errors,
    form,
    isSubmitting,
    submit,
    successMessage
} = useRegistrationRequestForm()

const toast = useToast()
const hasFeedback = computed(() => Boolean(apiError.value || successMessage.value))

async function handleSubmit() {
    const wasSuccessful = await submit()

    if (wasSuccessful) {
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Solicitud enviada correctamente',
            life: 4000
        })
        return
    }

    if (apiError.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: apiError.value,
            life: 4000
        })
    }
}
</script>

<template>
    <section id="registration" class="scroll-mt-32 px-6 py-16 sm:px-8 lg:px-20">
        <div class="mx-auto max-w-7xl px-0 py-0">
            <SectionHeading
                title="Regístrate ya"
                description="Para registrarte en Smiley Vision necesitamos recibir primero un correo electrónico de solicitud con los detalles de tu óptica."
            />

            <div class="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
                <div v-reveal="{ origin: 'left', distance: 40, duration: 780 }" class="space-y-6">
                    <form class="p-0 sm:pr-8" @submit.prevent="handleSubmit">
                        <div class="grid gap-5">
                            <div>
                                <label for="landing-email" class="mb-2 block text-sm font-bold text-sky-800">
                                    Correo electrónico
                                </label>
                                <input
                                    id="landing-email"
                                    v-model="form.email"
                                    type="email"
                                    autocomplete="email"
                                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                                    placeholder="Ingresa tu correo electrónico"
                                    @input="clearFeedback('email')"
                                >
                                <p v-if="errors.email" class="mt-2 text-sm text-red-600">
                                    {{ errors.email }}
                                </p>
                            </div>

                            <div>
                                <label for="landing-message" class="mb-2 block text-sm font-bold text-sky-800">
                                    Descripción de tu negocio
                                </label>
                                <textarea
                                    id="landing-message"
                                    v-model="form.message"
                                    rows="5"
                                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                                    placeholder="Ingresa los detalles de tu óptica para la verificación del negocio."
                                    @input="clearFeedback('message')"
                                ></textarea>
                                <p v-if="errors.message" class="mt-2 text-sm text-red-600">
                                    {{ errors.message }}
                                </p>
                            </div>

                            <div
                                v-if="hasFeedback"
                                :class="apiError ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'"
                                class="rounded-2xl border px-4 py-3 text-sm leading-6"
                            >
                                {{ apiError || successMessage }}
                            </div>

                            <button
                                type="submit"
                                :disabled="isSubmitting"
                                class="rounded-full bg-sky-700 px-7 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {{ isSubmitting ? 'Enviando...' : 'Solicitar registro' }}
                            </button>
                        </div>
                    </form>

                    <p class="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                        Tu solicitud será revisada por nuestro equipo. Una vez validada tu óptica, recibirás instrucciones para activar tu cuenta y poder realizar compras.
                    </p>
                </div>

                <div
                    v-reveal="{ origin: 'right', distance: 52, duration: 860, delay: 120 }"
                    class="flex items-center justify-center"
                >
                    <div class="relative flex aspect-square w-full max-w-[360px] items-center justify-center overflow-hidden">
                        <img
                            :src="sendImage"
                            alt="Imagen de avion de papel"
                            class="relative z-10 w-[150px] md:w-[300px]"
                        >
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
