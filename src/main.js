import './assets/main.css'
import router from './router'

import { revealOnScroll } from '@/modules/shared/ui/motion/revealOnScroll'
import '@fontsource/prompt/400.css'
import '@fontsource/prompt/500.css'
import '@fontsource/prompt/700.css'
import '@fontsource/prompt/800.css'
import Aura from '@primeuix/themes/aura'
import { createPinia } from 'pinia'
import { Toast, ToastService } from 'primevue'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
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
