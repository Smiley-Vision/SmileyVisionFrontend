<script setup lang="ts">
import { Form, FormField, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { computed, onMounted, ref } from 'vue'

import ModifyProductItemPanel from '@/modules/admin-products/components/ModifyProductItemPanel.vue'
import { useModifyProductForm } from '@/modules/admin-products/composables/useModifyProductForm'
import {
  type UpdateProductFormValues,
  updateProductSchema,
} from '@/modules/admin-products/schemas/updateProductSchema'
import Spinner from '@/modules/core/components/Spinner.vue'

const props = defineProps<{
  productId: number
}>()

const emit = defineEmits<{
  deleted: []
}>()

const backendUrl = import.meta.env.VITE_BACKEND_BASE

const {
  product,
  isLoading,
  isSubmitting,
  isDeleting,
  hasError,
  loadProduct,
  submitUpdate,
  deleteProduct,
} = useModifyProductForm(props.productId)

const resolver = zodResolver(updateProductSchema)
const showDeleteModal = ref(false)
const showItemsModal = ref(false)

const initialValues = computed(() => ({
  name: product.value?.name ?? '',
  description: product.value?.description ?? '',
}))

function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return

  void submitUpdate(event.values as UpdateProductFormValues)
}

async function handleDelete() {
  const success = await deleteProduct()
  if (!success) return

  showDeleteModal.value = false
  emit('deleted')
}

onMounted(async () => {
  await loadProduct()
})
</script>

<template>
  <Spinner :is-loading="isLoading" text="Cargando..." />

  <div v-if="!isLoading && hasError" class="flex flex-col items-center gap-y-3 py-24 text-center">
    <div class="flex size-20 items-center justify-center rounded-full bg-red-50 text-red-500">
      <i class="pi pi-exclamation-triangle" style="font-size: 2.5rem"></i>
    </div>
    <div class="text-2xl font-semibold text-sky-800">No se pudo cargar el producto</div>
  </div>

  <Form
    v-else-if="!isLoading"
    :key="product?.id"
    class="flex flex-col items-center w-full max-w-2xl mx-auto gap-8 px-2 py-4"
    :resolver="resolver"
    :initial-values="initialValues"
    @submit="handleSubmit"
  >
    <h2 class="text-3xl font-bold text-sky-800 text-center">Editar {{ product?.name }}</h2>

    <div class="w-48 h-48 relative group">
      <div
        class="w-full h-full flex items-center justify-center bg-slate-100 border-2 border-solid border-sky-400 rounded-2xl transition hover:bg-sky-50"
      >
        <img
          v-if="product?.image_path"
          :src="`${backendUrl}/storage/${product.image_path}`"
          alt="Vista previa"
          class="object-contain object-center w-full h-full rounded-2xl bg-white"
        />
      </div>
    </div>

    <FormField v-slot="$field" name="name" class="flex w-full flex-col gap-1">
      <label for="name" class="font-medium text-sky-700">Nombre del producto</label>
      <InputText id="name" fluid />
      <Message v-if="$field.invalid" severity="error" size="small">{{
        $field.error?.message
      }}</Message>
    </FormField>

    <FormField v-slot="$field" name="description" class="flex w-full flex-col gap-1">
      <label for="description" class="font-medium text-sky-700">Descripción</label>
      <Textarea id="description" rows="3" fluid />
      <Message v-if="$field.invalid" severity="error" size="small">{{
        $field.error?.message
      }}</Message>
    </FormField>

    <button
      type="button"
      class="text-sm font-semibold text-sky-700 underline hover:text-sky-900"
      @click="showItemsModal = true"
    >
      Editar variantes/ítems de este producto
    </button>

    <div class="flex flex-row justify-around md:w-2/3 w-full">
      <Button type="submit" label="ACEPTAR" :loading="isSubmitting" />
      <Button type="button" label="ELIMINAR" severity="danger" @click="showDeleteModal = true" />
    </div>
  </Form>

  <Dialog v-model:visible="showDeleteModal" modal :style="{ width: '28rem' }">
    <template #header>
      <div class="font-semibold text-[#075985]">Eliminar producto</div>
    </template>
    <div class="text-slate-700 leading-relaxed">
      ¿Estás seguro de que quieres eliminar <strong>{{ product?.name }}</strong
      >? Esta acción no se puede deshacer.
    </div>
    <template #footer>
      <div class="flex justify-end gap-3">
        <Button label="Cancelar" severity="secondary" text @click="showDeleteModal = false" />
        <Button
          label="Sí, eliminar"
          severity="danger"
          :loading="isDeleting"
          @click="handleDelete"
        />
      </div>
    </template>
  </Dialog>

  <Dialog v-model:visible="showItemsModal" modal :style="{ width: '64rem' }">
    <template #header>
      <div class="font-semibold text-[#075985]">Editar variantes de {{ product?.name }}</div>
    </template>
    <ModifyProductItemPanel :product-id="productId" />
  </Dialog>
</template>
