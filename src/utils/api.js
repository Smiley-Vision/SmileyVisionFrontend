/** This file is used to abstract fetch in one single place */

import { useAuthStore } from "@/stores/auth"

const API_BASE_URL = import.meta.env.VITE_API_BASE

async function fetchData(url, method = 'GET', body = {}) {
    const auth = useAuthStore()

    try {
        const isFormData = body instanceof FormData

        const fetchOptions = {
            method: method,
            headers: {}
        }

        if (auth.isAuthenticated) {
            fetchOptions.headers['Authorization'] = `Bearer ${auth.token}`
        }
        
        if (!isFormData) {
            fetchOptions.headers['Content-Type'] = 'application/json'
            fetchOptions.headers['Accept'] = 'application/json'
        }

        if (method !== 'GET') {
            fetchOptions.body = isFormData ? body : JSON.stringify(body)
        }

        const response = await fetch(`${API_BASE_URL}/${url}`, fetchOptions)
        const json = await response.json()

        if (!response.ok) throw json

        return json

    } catch (error) {
        throw error
    }
}

export { fetchData }