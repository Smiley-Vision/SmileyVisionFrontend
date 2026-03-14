<script setup>
import { api } from '@/shared/infrastructure/http/api';
import { normalizeCategoriesPayload } from '@/shared/utils/productApiAdapters';
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
    'category_id': null,
    'supplier_id': 1,
    'name': '',
    'description': ''
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
    formData.append('category_id', form.category_id)
    formData.append('supplier_id', form.supplier_id)
    formData.append('name', form.name)
    formData.append('description', form.description)

    try {
        const response = (await api.post('products', formData)).data

        if (response.message === 'Product created successfully') {
            // Reset the form
            Object.assign(form, initialState)
            form.category_id = productTypes.value[0]?.id ?? null
            imagePreview.value = null

            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Producto subido al sistema',
                life: 4000
            })
        }

    } catch (error) {
        const message = error?.errors
            ? error.errors[Object.keys(error.errors)[0]][0]
            : 'No se pudo crear el producto'

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
        productTypes.value = normalizeCategoriesPayload((await api.get('product-categories')).data)
        form.category_id = productTypes.value[0]?.id ?? null
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
        class="flex flex-col items-center max-w-2xl mx-auto mt-12 md:mb-0 mb-12 md:px-10 md:py-10 px-8 gap-10 md:bg-white md:rounded-3xl md:shadow-2xl">

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
            <label for="category_id" class="block text-sky-700 font-medium mb-1">Categoria de producto</label>
            <select v-model="form.category_id" id="category_id"
                class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" required>
                <option v-for="(type, index) in productTypes" :key="index" :value="type.id">
                    {{ type.name }}
                </option>
            </select>
        </div>

        <!-- Supplier -->
        <div class="w-full">
            <label for="supplier_id" class="block text-sky-700 font-medium mb-1">ID de proveedor</label>
            <input v-model="form.supplier_id" id="supplier_id" type="number"
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

        <!-- Submit Button -->
        <button type="submit"
            class="bg-sky-500 text-white font-semibold px-8 py-3 rounded-xl hover:bg-sky-600 transition">
            SUBIR
        </button>
    </form>

    <!-- Toast (Optional, depending on your library) -->
    <Toast position="bottom-right" />
</template>
