<script setup lang="ts">
import { FormField } from '@primevue/forms'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { computed, inject, ref } from 'vue'

import AddressLocationPicker from '@/modules/user/components/AddressLocationPicker.vue'
import type { CityOption } from '@/modules/user/interfaces/CityOption'

defineProps<{
  cityOptions: CityOption[]
  idPrefix: string
}>()

interface PrimeVueFormFieldState {
  value: unknown
  invalid: boolean
  error?: { message?: string }
}

interface PrimeVueFormInstance {
  getFieldState: (field: string) => PrimeVueFormFieldState | undefined
  setFieldValue: (field: string, value: unknown) => void
}

const pcForm = inject<PrimeVueFormInstance>('$pcForm')

const cityIdValue = computed(() => (pcForm?.getFieldState('city_id')?.value as number | null) ?? null)
const latitudeValue = computed(
  () => (pcForm?.getFieldState('latitude')?.value as number | null) ?? null,
)
const longitudeValue = computed(
  () => (pcForm?.getFieldState('longitude')?.value as number | null) ?? null,
)
const streetValue = computed(() => (pcForm?.getFieldState('street')?.value as string) ?? '')
const districtValue = computed(() => (pcForm?.getFieldState('district')?.value as string) ?? '')
const postalCodeValue = computed(
  () => (pcForm?.getFieldState('postal_code')?.value as string) ?? '',
)

const showLocationPicker = ref(false)

function handleLocationConfirm(payload: {
  latitude: number
  longitude: number
  street?: string
  district?: string
  postal_code?: string
}) {
  pcForm?.setFieldValue('latitude', payload.latitude)
  pcForm?.setFieldValue('longitude', payload.longitude)

  if (payload.street) pcForm?.setFieldValue('street', payload.street)
  if (payload.district) pcForm?.setFieldValue('district', payload.district)
  if (payload.postal_code) pcForm?.setFieldValue('postal_code', payload.postal_code)
}

function clearLocation() {
  pcForm?.setFieldValue('latitude', null)
  pcForm?.setFieldValue('longitude', null)
}
</script>

<template>
  <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
    <FormField v-slot="$field" name="city_id" class="flex flex-col gap-1">
      <label :for="`${idPrefix}_city_id`">Ciudad</label>
      <Select
        :id="`${idPrefix}_city_id`"
        :options="cityOptions"
        optionLabel="label"
        optionValue="value"
      />
      <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
    </FormField>
    <FormField v-slot="$field" name="district" class="flex flex-col gap-1">
      <label :for="`${idPrefix}_district`">Colonia</label>
      <InputText :id="`${idPrefix}_district`" />
      <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
    </FormField>
  </div>

  <FormField v-slot="$latitude" name="latitude" as-child>
    <FormField v-slot="$longitude" name="longitude" as-child>
      <div class="flex flex-col gap-1">
        <label>Ubicación en el mapa <span class="text-red-600">*</span></label>
        <div class="flex items-center gap-3">
          <Button
            type="button"
            label="Ubicar en el mapa"
            icon="pi pi-map-marker"
            severity="secondary"
            outlined
            :disabled="!cityIdValue"
            @click="showLocationPicker = true"
          />
          <span
            v-if="latitudeValue !== null && longitudeValue !== null"
            class="text-sm text-slate-600"
          >
            Ubicación guardada
            <button type="button" class="underline ml-1" @click="clearLocation">Quitar</button>
          </span>
        </div>
        <Message v-if="$latitude.invalid || $longitude.invalid" severity="error" size="small">
          {{ $latitude.error?.message ?? $longitude.error?.message }}
        </Message>
      </div>
    </FormField>
  </FormField>

  <AddressLocationPicker
    v-model:visible="showLocationPicker"
    :city-id="cityIdValue"
    :initial-latitude="latitudeValue"
    :initial-longitude="longitudeValue"
    :initial-street="streetValue"
    :initial-district="districtValue"
    :initial-postal-code="postalCodeValue"
    @confirm="handleLocationConfirm"
  />

  <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
    <FormField v-slot="$field" name="street" class="flex flex-col gap-1">
      <label :for="`${idPrefix}_street`">Calle</label>
      <InputText :id="`${idPrefix}_street`" />
      <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
    </FormField>
    <FormField v-slot="$field" name="external_number" class="flex flex-col gap-1">
      <label :for="`${idPrefix}_external_number`">Número exterior</label>
      <InputText :id="`${idPrefix}_external_number`" />
      <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
    </FormField>
  </div>

  <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
    <FormField v-slot="$field" name="between_a" class="flex flex-col gap-1">
      <label :for="`${idPrefix}_between_a`">Entre calle A</label>
      <InputText :id="`${idPrefix}_between_a`" />
      <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
    </FormField>
    <FormField v-slot="$field" name="between_b" class="flex flex-col gap-1">
      <label :for="`${idPrefix}_between_b`">Entre calle B</label>
      <InputText :id="`${idPrefix}_between_b`" />
      <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
    </FormField>
  </div>

  <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
    <FormField v-slot="$field" name="internal_number" class="flex flex-col gap-1">
      <label :for="`${idPrefix}_internal_number`">Número interior (opcional)</label>
      <InputText :id="`${idPrefix}_internal_number`" />
      <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
    </FormField>
    <FormField v-slot="$field" name="postal_code" class="flex flex-col gap-1">
      <label :for="`${idPrefix}_postal_code`">Código postal</label>
      <InputText :id="`${idPrefix}_postal_code`" />
      <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
    </FormField>
  </div>

  <FormField v-slot="$field" name="notes" class="flex flex-col gap-1">
    <label :for="`${idPrefix}_notes`">Referencias</label>
    <Textarea :id="`${idPrefix}_notes`" rows="3" />
    <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
  </FormField>

  <FormField name="is_default" as-child>
    <div class="flex items-center gap-2">
      <Checkbox :inputId="`${idPrefix}_is_default`" binary />
      <label :for="`${idPrefix}_is_default`">Marcar como dirección principal</label>
    </div>
  </FormField>
</template>
