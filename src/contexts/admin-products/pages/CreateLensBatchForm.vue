<script setup>
import { onMounted } from 'vue'
import { useToast } from 'primevue'

import { useBatchLensesCreation } from '@/contexts/admin-products/composables/useBatchLensesCreation'

const toast = useToast()

const {
    form,
    isLoading,
    isSubmitting,
    micasProducts,
    validation,
    canSubmit,
    batchResult,
    loadMicasProducts,
    submitBatch
} = useBatchLensesCreation(toast)

onMounted(async () => {
    await loadMicasProducts()
})
</script>

<template>
    <div class="flex flex-col max-w-3xl mx-auto mt-12 md:mb-0 mb-12 md:px-10 md:py-10 px-8 gap-8 md:bg-white md:rounded-3xl md:shadow-2xl">
        <div class="flex flex-col gap-2">
            <h2 class="text-3xl font-bold text-sky-800 text-center">Crear items de lentes en lote</h2>
            <p class="text-sm text-slate-600 text-center">
                Selecciona un producto de lentes y define los intervalos de esfera y cilindro.
            </p>
        </div>

        <div v-if="isLoading" class="flex flex-col items-center gap-y-6 py-8">
            <div class="text-sky-600 pi pi-spinner-dotted animate-spin" style="font-size: 5rem"></div>
            <div class="text-xl font-semibold text-sky-700">Cargando productos...</div>
        </div>

        <form v-else @submit.prevent="submitBatch" class="flex flex-col gap-6">
            <div>
                <label for="product_id" class="block text-sky-700 font-medium mb-1">Producto base de lentes</label>
                <select
                    id="product_id"
                    v-model="form.productId"
                    class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
                    required
                >
                    <option disabled value="">Selecciona un producto</option>
                    <option v-for="product in micasProducts" :key="product.id" :value="product.id">
                        {{ product.name }}
                    </option>
                </select>
            </div>

            <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
                <div>
                    <label for="sphere_min" class="block text-sky-700 font-medium mb-1">Esfera desde</label>
                    <input
                        id="sphere_min"
                        v-model="form.sphereMin"
                        type="text"
                        placeholder="-6.00"
                        class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
                        required
                    />
                </div>
                <div>
                    <label for="sphere_max" class="block text-sky-700 font-medium mb-1">Esfera hasta</label>
                    <input
                        id="sphere_max"
                        v-model="form.sphereMax"
                        type="text"
                        placeholder="6.00"
                        class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
                        required
                    />
                </div>
                <div>
                    <label for="cylinder_min" class="block text-sky-700 font-medium mb-1">Cilindro desde (cerca de 0)</label>
                    <input
                        id="cylinder_min"
                        v-model="form.cylinderMin"
                        type="text"
                        placeholder="0.00"
                        class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
                        required
                    />
                </div>
                <div>
                    <label for="cylinder_max" class="block text-sky-700 font-medium mb-1">Cilindro hasta (mas negativo)</label>
                    <input
                        id="cylinder_max"
                        v-model="form.cylinderMax"
                        type="text"
                        placeholder="-6.00"
                        class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-300"
                        required
                    />
                </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-2">
                <div class="font-semibold text-sky-800">Vista previa</div>
                <div class="text-sm text-slate-700">
                    Valores de esfera: {{ validation.sphereCount }} |
                    Valores de cilindro: {{ validation.cylinderCount }}
                </div>
                <div class="text-sm text-slate-700 font-semibold">
                    Total de combinaciones: {{ validation.total }}
                </div>
            </div>

            <div v-if="validation.errors.length > 0" class="rounded-2xl border border-red-300 bg-red-50 p-4">
                <div class="font-semibold text-red-700 mb-2">Errores</div>
                <ul class="list-disc pl-5 text-sm text-red-700">
                    <li v-for="error in validation.errors" :key="error">{{ error }}</li>
                </ul>
            </div>

            <button
                type="submit"
                :disabled="!canSubmit"
                :class="[
                    canSubmit ? 'bg-sky-500 hover:bg-sky-600' : 'bg-slate-400',
                    'text-white font-semibold px-8 py-3 rounded-xl transition'
                ]"
            >
                {{ isSubmitting ? 'Creando productos...' : 'Crear productos' }}
            </button>
        </form>

        <div v-if="batchResult" class="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 flex flex-col gap-2">
            <div class="font-semibold text-emerald-800">Resultado de la creación</div>
            <div class="text-sm text-emerald-800">Productos creados: {{ batchResult.created }}</div>
            <div class="text-sm text-emerald-800">Combinaciones ya existentes: {{ batchResult.skipped }}</div>
            <div class="text-sm text-emerald-800">Combinaciones procesadas: {{ batchResult.total }}</div>
        </div>
    </div>

    <Toast position="bottom-right" />
</template>
