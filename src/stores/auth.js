import { fetchData } from "@/utils/api";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token'))
    const user = ref(JSON.parse(localStorage.getItem('user')) || '{}')
    const justLoggedIn = ref(false)
    const justRegistered = ref(false)
    const justSubmittedRequest = ref(false)

    const isAuthenticated = computed(() => !!token.value)
    const isAdmin = computed(() => user.value?.role_id === 1 || false)

    const login = async (email, password) => {
        try {
            const body = { email, password }
            const data = await fetchData('login', 'POST', body)

            token.value = data.token
            user.value = data.user
            justLoggedIn.value = true

            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
        } catch (error) {
            throw error
        }
    }

    const logout = async () => {
        try {
            await fetchData('logout', 'POST')

            token.value = null
            user.value = null
    
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        } catch (error) {
            throw error
        }
    }

    const checkToken = async (token) => {
        try {
            const response = await fetchData(`check-register-token?token=${token}`, 'GET')
            return response
        } catch (error) {
            throw error
        }
    }

    return {
        token,
        user,
        justLoggedIn,
        justRegistered,
        justSubmittedRequest,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        checkToken
    }
})