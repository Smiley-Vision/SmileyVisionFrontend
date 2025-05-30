<script setup>
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

const token = route.params.token
const isTokenValid = ref(false)

// Check if the token exists in the
// database and if it's available, via
// fetch.
const checkURLToken = async (token) => {
    try {
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
    // console.log(token);
    

    // try {
    //     const response = await auth.checkToken(token)

    //     console.log('checkToken response:', response)

    //     if (response.message === "Token exists and it's available") {
    //         console.log('Response is OK');
            
    //         isTokenValid.value = true
    //     }
    // } catch (error) {
    //     throw error
    // }
}

onMounted(async () => {
    await checkURLToken(token)
})
</script>

<template>
    <div v-if="isTokenValid" class="text-xl font-semibold">
        This is the user Register view.
    </div>
    <div v-else class="text-xl font-semibold">
        The token is invalid or something else happened.
    </div>

    <!-- Toast -->
    <Toast position="bottom-right"/>
</template>