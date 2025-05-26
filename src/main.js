import './assets/main.css'
import router from './router'

import { createApp } from 'vue'
import { createPinia } from 'pinia';
import { ToastService } from 'primevue';
import '@fontsource/inter';
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(ToastService)
app.mount('#app')