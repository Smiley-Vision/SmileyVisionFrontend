import { api } from "@/shared/infrastructure/http/api";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token'))
    const user = ref(JSON.parse(localStorage.getItem('user')) || '{}')

    const isAuthenticated = computed(() => !!token.value)
    const isAdmin = computed(() => user.value?.role_id === 1 || false)

    const login = async (email, password) => {
        try {
            const body = { email, password }
            const data = (await api.post('login', body)).data

            token.value = data.token
            user.value = data.user

            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
        } catch (error) {
            throw error
        }
    }

    const logout = async () => {
        try {
            await api.post('logout')

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
            const response = (await api.get(`check-register-token?token=${token}`)).data
            return response
        } catch (error) {
            throw error
        }
    }

    return {
        token,
        user,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        checkToken
    }
})
