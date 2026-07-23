// Supports weights 100-900
import '@fontsource-variable/hanken-grotesk/wght.css'
import { createPinia } from 'pinia'
import { Toast, ToastService } from 'primevue'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'

import { revealOnScroll } from '@/modules/core/motion/revealOnScroll'

import App from './App.vue'
import './assets/main.css'
import router from './router'
import { SmileyPreset } from './theme/smileyPreset'

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(PrimeVue, {
  theme: {
    preset: SmileyPreset,
    options: {
      prefix: 'p',
      darkModeSelector: 'light',
      cssLayer: false,
    },
  },
})
app.use(ToastService)
app.component('Toast', Toast)
app.directive('reveal', revealOnScroll)

app.mount('#app')
