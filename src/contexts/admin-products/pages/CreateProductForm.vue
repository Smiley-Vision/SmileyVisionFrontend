<script setup>
import { api } from '@/shared/infrastructure/http/api';
import { normalizeCategoriesPayload } from '@/shared/utils/productApiAdapters';
import { getSuppliersService } from '@/contexts/admin-products/services/adminProductsService';
import { useToast } from 'primevue';
import { computed, onMounted, reactive, ref } from 'vue';

const toast = useToast()
const productTypes = ref([])
const suppliers = ref([])
const imagePreview = ref(null)
const imageInput = ref(null)
const isSubmitting = ref(false)
const formErrors = ref([])

const initialState = {
    'image': null,
    'file_name': '',
    'category_id': null,
    'supplier_id': null,
    'name': '',
    'description': ''
}

// Form object; request body
const form = reactive({ ...initialState })

const isMicasCategorySelected = computed(() => {
    const selectedCategory = productTypes.value.find((type) => type.id === form.category_id)
    const selectedName = String(selectedCategory?.name ?? '').toLowerCase()

    return selectedName.includes('mica')
})

function retrieveImage(event) {
    const file = event.target.files[0]

    if (file) {
        form.image = file
        form.file_name = file.name

        imagePreview.value = URL.createObjectURL(file)
    }
}

function resetImageInput() {
    if (imageInput.value) {
        imageInput.value.value = ''
    }
}

function addError(message) {
    if (message && !formErrors.value.includes(message)) {
        formErrors.value.push(message)
    }
}

function validateForm() {
    formErrors.value = []

    if (!form.image) addError('Selecciona una imagen del producto.')
    if (!form.category_id) addError('Selecciona una categoria de producto.')
    if (!form.supplier_id) addError('Selecciona un proveedor.')
    if (!String(form.name).trim()) addError('Captura el nombre del producto.')
    if (!String(form.description).trim()) addError('Captura la descripcion del producto.')

    return formErrors.value.length === 0
}

function getApiErrorMessages(error) {
    if (error?.errors && typeof error.errors === 'object') {
        return Object.entries(error.errors).flatMap(([field, messages]) => {
            const normalizedMessages = Array.isArray(messages) ? messages : [messages]

            return normalizedMessages
                .filter(Boolean)
                .map((message) => `${field}: ${message}`)
        })
    }

    if (error?.message) return [error.message]

    return ['No se pudo crear el producto. Revisa los datos e intenta de nuevo.']
}

// Submit the form
const submitForm = async () => {
    if (isSubmitting.value || !validateForm()) {
        toast.add({
            severity: 'warn',
            summary: 'Datos incompletos',
            detail: formErrors.value[0] ?? 'Revisa el formulario',
            life: 5000
        })
        return
    }

    const formData = new FormData()
    formData.append('image', form.image)
    formData.append('file_name', form.file_name)
    formData.append('category_id', form.category_id)
    formData.append('supplier_id', form.supplier_id)
    formData.append('name', form.name)
    formData.append('description', form.description)

    isSubmitting.value = true

    try {
        await api.post('products', formData)

        // Reset the form
        Object.assign(form, initialState)
        form.category_id = productTypes.value[0]?.id ?? null
        form.supplier_id = suppliers.value[0]?.id ?? null
        imagePreview.value = null
        formErrors.value = []
        resetImageInput()

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto subido al sistema',
            life: 4000
        })

    } catch (error) {
        formErrors.value = getApiErrorMessages(error)

        toast.add({
            severity: 'error',
            summary: 'No se pudo crear el producto',
            detail: formErrors.value[0],
            life: 7000
        })
    } finally {
        isSubmitting.value = false
    }
}

// Retrieve the product types
onMounted(async () => {
    try {
        const [productTypesResponse, suppliersResponse] = await Promise.all([
            api.get('product-categories'),
            getSuppliersService()
        ])

        productTypes.value = normalizeCategoriesPayload(productTypesResponse.data)
        suppliers.value = Array.isArray(suppliersResponse) ? suppliersResponse : []
        form.category_id = productTypes.value[0]?.id ?? null
        form.supplier_id = suppliers.value[0]?.id ?? null
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron obtener los tipos de producto o proveedores',
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
            <input id="image" ref="imageInput" @change="retrieveImage" type="file" accept="image/*" class="hidden" required />
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
            <label for="supplier_id" class="block text-sky-700 font-medium mb-1">Proveedor</label>
            <select v-model="form.supplier_id" id="supplier_id"
                class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300" required>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                    {{ supplier.name }}
                </option>
            </select>
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

        <RouterLink
            v-if="isMicasCategorySelected"
            :to="{ name: 'admin-products-create-lenses-batch' }"
            class="w-full text-center bg-sky-100 border border-sky-300 text-sky-800 font-semibold px-6 py-3 rounded-xl hover:bg-sky-200 transition"
        >
            Crear items de lentes en lote
        </RouterLink>

        <div v-if="formErrors.length > 0" class="w-full rounded-xl border border-red-300 bg-red-50 p-4">
            <div class="font-semibold text-red-700 mb-2">Corrige estos errores</div>
            <ul class="list-disc pl-5 text-sm text-red-700">
                <li v-for="error in formErrors" :key="error">{{ error }}</li>
            </ul>
        </div>

        <!-- Submit Button -->
        <button
            type="submit"
            :disabled="isSubmitting"
            :class="[
                isSubmitting ? 'bg-slate-400' : 'bg-sky-500 hover:bg-sky-600',
                'text-white font-semibold px-8 py-3 rounded-xl transition'
            ]"
        >
            {{ isSubmitting ? 'SUBIENDO...' : 'SUBIR' }}
        </button>
    </form>

    <!-- Toast (Optional, depending on your library) -->
    <Toast position="bottom-right" />
</template>
