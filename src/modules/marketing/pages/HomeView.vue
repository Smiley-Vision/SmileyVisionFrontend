<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAppToast } from '@/modules/core/composables/useAppToast'
import { useAuthStore } from '@/modules/core/stores/auth'
import BenefitsSection from '@/modules/marketing/components/home/BenefitsSection.vue'
import BranchesSection from '@/modules/marketing/components/home/BranchesSection.vue'
import HeroSection from '@/modules/marketing/components/home/HeroSection.vue'
import RegistrationApplicationSection from '@/modules/marketing/components/home/RegistrationApplicationSection.vue'
import StoreSection from '@/modules/marketing/components/home/StoreSection.vue'
import WelcomeSection from '@/modules/marketing/components/home/WelcomeSection.vue'

const route = useRoute()
const router = useRouter()
const notify = useAppToast()
const auth = useAuthStore()
const welcomeName = computed(() => {
  const currentUser = auth.user
  if (!currentUser) return 'usuario'

  const fullName = [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ').trim()
  return fullName || currentUser.email || 'usuario'
})

onMounted(async () => {
  if (route.query.justLoggedIn === 'true') {
    notify('success', 'Éxito', `Bienvenido, ${welcomeName.value}`)
    await router.replace({ query: { ...route.query, justLoggedIn: undefined } })
  } else if (route.query.justSubmittedRequest === 'true') {
    notify('success', 'Éxito', 'Solicitud enviada correctamente')
    await router.replace({ query: { ...route.query, justSubmittedRequest: undefined } })
  }
})

function scrollToSection(sectionId: string) {
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
    <RegistrationApplicationSection />
  </div>
</template>
