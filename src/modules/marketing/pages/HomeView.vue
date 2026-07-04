<script setup>
import BenefitsSection from '@/modules/marketing/components/home/BenefitsSection.vue'
import BranchesSection from '@/modules/marketing/components/home/BranchesSection.vue'
import HeroSection from '@/modules/marketing/components/home/HeroSection.vue'
import RegistrationRequestSection from '@/modules/marketing/components/home/RegistrationRequestSection.vue'
import StoreSection from '@/modules/marketing/components/home/StoreSection.vue'
import WelcomeSection from '@/modules/marketing/components/home/WelcomeSection.vue'
import { useAuthStore } from '@/modules/identity/stores/auth'
import { useToast } from 'primevue'
import { computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const auth = useAuthStore()
const welcomeName = computed(() => {
  const currentUser = auth.user || {}
  const fullName = [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ').trim()
  return fullName || currentUser.name || currentUser.email || 'usuario'
})

onMounted(async () => {
  await nextTick() // Let Toast render first

  if (route.query.justLoggedIn === 'true') {
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Bienvenido, ${welcomeName.value}`,
      life: 4000,
    })

    auth.justLoggedIn = false
    await router.replace({ query: { ...route.query, justLoggedIn: undefined } })
  } else if (route.query.justSubmittedRequest === 'true') {
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Solicitud enviada correctamente',
      life: 4000,
    })

    auth.justSubmittedRequest = false
    await router.replace({ query: { ...route.query, justSubmittedRequest: undefined } })
  }
})

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}
</script>

<template>
  <div class="pb-8 pt-4 md:pb-12">
    <HeroSection @scroll-to="scrollToSection" />
    <WelcomeSection @scroll-to="scrollToSection" />
    <StoreSection />
    <BenefitsSection />
    <BranchesSection />
    <RegistrationRequestSection />
  </div>

  <Toast position="top-right" />
</template>
