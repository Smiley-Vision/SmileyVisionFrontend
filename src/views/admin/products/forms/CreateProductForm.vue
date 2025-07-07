<script setup>
import { fetchData } from '@/utils/api';
import { useToast } from 'primevue';
import { reactive } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';

const toast = useToast()
const productTypes = ref([])
const imagePreview = ref(null)

const initialState = {
    'image': null,
    'file_name': '',
    'type_id': 1,
    'code': '',
    'name': '',
    'description': '',
    'price': 0,
}

// Form object; request body
const form = reactive({ ...initialState })

function retrieveImage(event) {
    const file = event.target.files[0]

    if (file) {
        form.image = file
        form.file_name = file.name

        imagePreview.value = URL.createObjectURL(file)
    }
}

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
        const response = await fetchData('products', 'POST', formData)

        if (response.message === 'Product created successfully') {
            // Reset the form
            Object.assign(form, initialState)
            imagePreview.value = null

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
    <form @submit.prevent="submitForm"
        class="flex flex-col items-center max-w-2xl mx-auto my-12 p-10 gap-10 bg-white rounded-3xl shadow-2xl">

        <!-- Title -->
        <h2 class="text-3xl font-bold text-sky-800 text-center">Subir producto al sistema</h2>

        <!-- Image Upload with Preview -->
        <div class="w-48 h-48 relative cursor-pointer group" @click="$refs.imageInput.click()">
            <input ref="imageInput" @change="retrieveImage" type="file" class="hidden" required />
            <div
                class="w-full h-full flex items-center justify-center bg-slate-100 border-2 border-dashed border-sky-400 rounded-2xl transition hover:bg-sky-50">
                <img v-if="imagePreview" :src="imagePreview" alt="Vista previa"
                    class="object-cover w-full h-full rounded-2xl" />
                <span v-else class="text-sky-400 text-5xl font-bold select-none">+</span>
            </div>
            <p class="text-sm text-center mt-2 text-gray-600">Haz clic para seleccionar imagen</p>
        </div>

        <!-- Type -->
        <div class="w-full">
            <label for="type_id" class="block text-sky-700 font-medium mb-1">Tipo de producto</label>
            <select v-model="form.type_id" id="type_id"
                class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" required>
                <option v-for="(type, index) in productTypes" :key="index" :value="index + 1">
                    {{ type.name }}
                </option>
            </select>
        </div>

        <!-- Code -->
        <div class="w-full">
            <label for="code" class="block text-sky-700 font-medium mb-1">Código del producto</label>
            <input v-model="form.code" id="code" type="text"
                class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" required />
        </div>

        <!-- Name -->
        <div class="w-full">
            <label for="name" class="block text-sky-700 font-medium mb-1">Nombre del producto</label>
            <input v-model="form.name" id="name" type="text"
                class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" required />
        </div>

        <!-- Description -->
        <div class="w-full">
            <label for="description" class="block text-sky-700 font-medium mb-1">Descripción</label>
            <input v-model="form.description" id="description" type="text"
                class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" required />
        </div>

        <!-- Price -->
        <div class="w-full">
            <label for="price" class="block text-sky-700 font-medium mb-1">Precio ($)</label>
            <input v-model="form.price" id="price" type="number" step="0.01"
                class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" required />
        </div>

        <!-- Submit Button -->
        <button type="submit"
            class="bg-sky-500 text-white font-semibold px-8 py-3 rounded-xl hover:bg-sky-600 transition">
            SUBIR
        </button>
    </form>

    <!-- Toast (Optional, depending on your library) -->
    <Toast position="bottom-right" />
</template>