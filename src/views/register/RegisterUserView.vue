<script setup>
import { fetchData } from '@/utils/api';
import { onMounted } from 'vue';
import { reactive } from 'vue';

const form = reactive({
    'name': '',
    'email': '',
    'phone': '',
    'password': '',
    'role_id': 2,
    'store_id': 0,
})

const roles = ['Óptico', 'Conductor']
const stores = []

// Retrieve the available stores as an array
const retrieveStores = async () => {
    try {
        const response = JSON.stringify(await fetchData('get-stores', 'GET'))
        const data = JSON.parse(response)
       
        data.forEach(store => { stores.push(store['name']) })
        
    } catch (error) {
        throw error
    }
}

onMounted(async () => {
    retrieveStores()
})
</script>

<template>
    <div class="text-xl font-semibold">
        This is the user Register view.
    </div>
</template>