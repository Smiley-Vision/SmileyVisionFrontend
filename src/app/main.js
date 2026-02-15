import '../assets/main.css'
import router from './router'

import { createApp } from 'vue'
import { createPinia } from 'pinia';
import { Toast, ToastService } from 'primevue';
import '@fontsource/inter';
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
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
            cssLayer: false
        }
    }
})
app.use(ToastService)
app.component('Toast', Toast)

app.mount('#app')
