<script setup>
import { useAuthStore } from '@/stores/auth';
import { fetchData } from '@/utils/api';
import { useToast } from 'primevue';
import { reactive } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';

const toast = useToast()
const productTypes = ref([])

// Form object; request body
const form = reactive({
    'image': null,
    'file_name': '',
    'type_id': 1,
    'code': '',
    'name': '',
    'description': '',
    'price': 0,
})

// Submit the form
const submitForm = async () => {
    const formData = new FormData()
    formData.append('image', form.image)
    formData.append('file_name', form.file_name)
    formData.append('type_id', form.type_id)
    formData.append('code', form.code)
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('price', form.price)

    try {
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value)
        }

        const response = await fetchData('products', 'POST', formData)
        const data = await response.json()

        if (response.ok) {
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Producto subido al sistema',
                life: 4000
            })
        }

    } catch (error) {
        // Show the first validation error
        const firstField = Object.keys(error.errors)[0]
        const message = error.errors[firstField][0]

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 4000
        })
    }
}

// Retrieve the image file
const retrieveImage = (event) => {
    form.image = event.target.files[0]
    form.file_name = event.target.files[0].name
}

// Retrieve the product types
onMounted(async () => {
    try {
        productTypes.value = await fetchData('product-types', 'GET')
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron obtener los tipos de producto',
            life: 4000
        })
    }
})
</script>

<template>
    <!-- Form content -->
    <form @submit.prevent="submitForm" class="flex flex-col lg:mx-auto items-center mx-10 lg:mt-12 mt-10 p-6 gap-y-8 bg-slate-400 rounded-xl max-w-xl">

        <!-- Title -->
        <div class="font-medium text-xl">
            Subir producto al sistema
        </div>

        <!-- Image -->
        <div class="flex flex-row items-center gap-x-4">
            <label for="image_url">Imagen del producto:</label>
            <input @change="retrieveImage" type="file" name="image_url" id="image_url" required>
        </div>

        <!-- Type -->
        <div class="flex flex-row items-center gap-x-4">
            <label for="type_id">Tipo de producto:</label>
            <select v-model="form.type_id" name="type_id" id="type_id" required>
                <option v-for="(type, index) in productTypes" :key="index" :value="index + 1">
                    {{ type.name }}
                </option>
            </select>
        </div>

        <!-- Code -->
        <div class="flex flex-row items-center gap-x-4">
            <label for="code">Código del producto:</label>
            <input v-model="form.code" type="text" name="code" id="code" required>
        </div>

        <!-- Name -->
        <div class="flex flex-row items-center gap-x-4">
            <label for="name">Nombre del producto:</label>
            <input v-model="form.name" type="text" name="name" id="name" required>
        </div>

        <!-- Description -->
        <div class="flex flex-row items-center gap-x-4">
            <label for="description">Descripción del producto:</label>
            <input v-model="form.description" type="text" name="description" id="description" required>
        </div>

        <!-- Price -->
        <div class="flex flex-row items-center gap-x-4">
            <label for="price">Precio del producto: $</label>
            <input v-model="form.price" type="number" name="price" id="price" required>
        </div>

        <!-- Submit button -->
        <button class="rounded-xl bg-sky-300 p-4 " type="submit">SUBIR</button>
    </form>

    <!-- Toast -->
    <Toast position="bottom-right"/>
</template>