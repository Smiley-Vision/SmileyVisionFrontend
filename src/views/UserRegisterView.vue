<script setup>
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import RequestRegisterView from './register/RequestRegisterView.vue';
import RegisterUserView from './register/RegisterUserView.vue';

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

const token = route.query.token
const isTokenValid = ref(false)
let email

// Check the availability of the URL token
const checkURLToken = async (token) => {
    if (!token) return

    try {
        const response = JSON.stringify(await auth.checkToken(token))
        const data = JSON.parse(response)

        if (data.message === "Token exists and it's available") {
            isTokenValid.value = true
            email = data['email']
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Token inválido o expirado',
            life: 4000 // 4 seconds
        })
    }
}

onMounted(async () => {
    await checkURLToken(token)
})
</script>

<template>
    <!-- Valid URL token (use props here to pre-fill the email field) -->
    <div v-if="isTokenValid">
        <RegisterUserView
            :email="email"
        ></RegisterUserView>
    </div>

    <!-- Not using a URL token -->
    <div v-else-if="!token">
        <RequestRegisterView></RequestRegisterView>
    </div>

    <!-- Invalid URL token--display an error -->
    <div v-else>
        The token is invalid
    </div>
    <!-- Toast -->
    <Toast position="bottom-right"/>
</template>