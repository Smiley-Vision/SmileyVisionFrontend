<script setup>
import { fetchData } from '@/shared/infrastructure/http/api';
import { useToast } from 'primevue';
import { computed } from 'vue';
import { reactive } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const backendUrl = import.meta.env.VITE_BACKEND_URL

const route = useRoute()
const toast = useToast()

const isLoading = ref(true)
const showDeleteModal = ref(false)
const imagePreview = ref(null)
const code = ref('')
const initialState = ref({})

const productCode = route.params.code

// Form object; request body
const form = reactive({
    'name': '',
    'description': '',
    'price': 0,
})

// Checks if the form has been changed
const isFormModified = computed(() => {
    return (
        form.name !== initialState.value.name ||
        form.description !== initialState.value.description ||
        form.price !== initialState.value.price
    )
})

const submitForm = async () => {
    try {
        const body = {
            name: form.name,
            description: form.description,
            price: form.price
        }

        const response = await fetchData(`products/${productCode}`, 'PATCH', body)

        if (response.message === 'Product updated successfully') {
            await retrieveProductState()

            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Producto editado correctamente',
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

const deleteProduct = async () => {
    try {
        const response = await fetchData(`products/${productCode}`, 'DELETE')

        toast.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Producto eliminado correctamente',
            life: 4000
        })

        // Redirigir o recargar
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el producto',
            life: 4000
        })
    }

    showDeleteModal.value = false
}

// Retrieve the current product's state
const retrieveProductState = async () => {
    const response = await fetchData(`products/${productCode}`, 'GET')

    // Fill the form with the product state
    form.image_url = response.image_url
    form.name = response.name
    form.description = response.description
    form.price = response.price
    imagePreview.value = `${backendUrl}/storage/${form.image_url}`

    code.value = response.code

    // Save initial state for comparison
    initialState.value = {
        image: response.image,
        name: response.name,
        description: response.description,
        price: response.price,
        image_url: response.image_url
    }
}

onMounted(async () => {
    try {
        await retrieveProductState()

        isLoading.value = false
        
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo obtener el estado del producto',
            life: 4000
        })
    }
})
</script>

<template>
    <!-- Loading screen -->
    <div v-if="isLoading" class="flex flex-col mx-auto my-auto items-center gap-y-8 mt-24">
        <div
            class="text-sky-600 pi pi-spinner-dotted animate-spin slow-spin"
            style="font-size: 8rem">
        </div>
        <div class="lg:text-5xl text-4xl text-sky-700 font-bold">
            Cargando...
        </div>
    </div>

    <!-- Form content -->
    <form v-else @submit.prevent="submitForm"
        class="flex flex-col items-center max-w-2xl mx-auto mt-12 md:mb-0 mb-12 md:px-10 md:py-10 px-8 gap-10 md:bg-white md:rounded-3xl md:shadow-2xl">

        <!-- Title -->
        <h2 class="text-3xl font-bold text-sky-800 text-center">Editar {{ form.name }}</h2>

        <!-- Image preview -->
        <div class="w-48 h-48 relative group">
            <div
                class="w-full h-full flex items-center justify-center bg-slate-100 border-2 border-solid border-sky-400 rounded-2xl transition hover:bg-sky-50">
                <img v-if="imagePreview" :src="imagePreview" alt="Vista previa"
                    class="object-cover w-full h-full rounded-2xl" />
            </div>
        </div>

        <!-- Code -->
        <div class="w-full">
            <label for="code" class="block text-sky-700 font-medium mb-1">Código del producto</label>
            <input v-model="code" id="code" type="text" disabled
                class="w-full text-slate-500 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" required />
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

        <!-- Submit and delete buttons -->
        <div class="flex flex-row justify-around md:w-2/3 w-full">
            <button
                type="submit"
                :disabled="!isFormModified"
                :class="[isFormModified ? 'bg-sky-500 hover:bg-sky-600' : 'bg-slate-400',
                                          'text-white font-semibold px-8 py-3 rounded-xl']"
            >
                ACEPTAR
            </button>
            <button
                type="button"
                @click="showDeleteModal = true"
                class="bg-red-500 text-white font-semibold px-8 py-3 rounded-xl hover:bg-red-600 transition">
                ELIMINAR
            </button>
        </div>
    </form>

    <!-- Delete modal -->
    <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        >
        <div class="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-6">
            <p class="text-xl text-slate-700 font-semibold">
            ¿Estás seguro de que quieres eliminar este producto?
            </p>
            <div class="flex justify-center gap-x-4">
            <button
                class="bg-slate-300 hover:bg-slate-400 px-5 py-2 rounded-xl"
                @click="showDeleteModal = false"
            >
                Cancelar
            </button>
            <button
                class="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl"
                @click="deleteProduct"
            >
                Sí, eliminar
            </button>
            </div>
        </div>
    </div>

    <!-- Toast (Optional, depending on your library) -->
    <Toast position="bottom-right" />
</template>