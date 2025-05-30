<script setup>
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import RequestRegisterView from './register/RequestRegisterView.vue';

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

const token = route.query.token
const isTokenValid = ref(false)

// Check the availability of the URL token
const checkURLToken = async (token) => {
    if (!token) return

    try {
        console.log(token);
        
        const response = await auth.checkToken(token)

        if (response.message === "Token exists and it's available")
            isTokenValid.value = true
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
    <div v-if="isTokenValid" class="text-xl font-semibold">
        This is the user Register view.
    </div>
    <!-- Not using a URL token -->
    <div v-else-if="!token" class="flex flex-col gap-y-8">
        <RequestRegisterView></RequestRegisterView>
    </div>
    <!-- Invalid URL token--display an error -->
    <div v-else class="text-xl font-semibold">
        The token is invalid
    </div>
    <!-- Toast -->
    <Toast position="bottom-right"/>
</template>