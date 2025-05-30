<script setup>
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

const token = route.query.token
const isTokenValid = ref(false)

// Check if the token exists in the
// database and if it's available, via
// fetch.
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
    <div v-if="isTokenValid" class="text-xl font-semibold">
        This is the user Register view.
    </div>
    <div v-else-if="!token" class="text-xl font-semibold">
        Register view without token
    </div>
    <div v-else class="text-xl font-semibold">
        The token is invalid
    </div>

    <!-- Toast -->
    <Toast position="bottom-right"/>
</template>