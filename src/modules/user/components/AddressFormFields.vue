<script setup lang="ts">
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { ref } from 'vue'

import AddressLocationPicker from '@/modules/user/components/AddressLocationPicker.vue'
import type { AddressFormData } from '@/modules/user/interfaces/Address'
import type { CityOption } from '@/modules/user/interfaces/CityOption'

const props = defineProps<{
  form: AddressFormData
  cityOptions: CityOption[]
  idPrefix: string
}>()

const showLocationPicker = ref(false)

function handleLocationConfirm(payload: {
  latitude: number
  longitude: number
  street?: string
  district?: string
  postal_code?: string
}) {
  props.form.latitude = payload.latitude
  props.form.longitude = payload.longitude

  if (payload.street) props.form.street = payload.street
  if (payload.district) props.form.district = payload.district
  if (payload.postal_code) props.form.postal_code = payload.postal_code
}

function clearLocation() {
  props.form.latitude = null
  props.form.longitude = null
}
</script>

<template>
  <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
    <div class="flex flex-col gap-1">
      <label :for="`${idPrefix}_city_id`">Ciudad</label>
      <Select
        :id="`${idPrefix}_city_id`"
        v-model="form.city_id"
        :options="cityOptions"
        optionLabel="label"
        optionValue="value"
        required
      />
    </div>
    <div class="flex flex-col gap-1">
      <label :for="`${idPrefix}_district`">Colonia</label>
      <InputText :id="`${idPrefix}_district`" v-model="form.district" required />
    </div>
  </div>

  <div class="flex flex-col gap-1">
    <label>Ubicación en el mapa <span class="text-red-600">*</span></label>
    <div class="flex items-center gap-3">
      <Button
        type="button"
        label="Ubicar en el mapa"
        icon="pi pi-map-marker"
        severity="secondary"
        outlined
        :disabled="!form.city_id"
        @click="showLocationPicker = true"
      />
      <span v-if="form.latitude !== null && form.longitude !== null" class="text-sm text-slate-600">
        Ubicación guardada
        <button type="button" class="underline ml-1" @click="clearLocation">Quitar</button>
      </span>
      <span v-else class="text-sm text-red-600">
        Debes ubicar tu dirección en el mapa para poder guardar.
      </span>
    </div>
  </div>

  <AddressLocationPicker
    v-model:visible="showLocationPicker"
    :city-id="form.city_id"
    :initial-latitude="form.latitude"
    :initial-longitude="form.longitude"
    :initial-street="form.street"
    :initial-district="form.district"
    :initial-postal-code="form.postal_code"
    @confirm="handleLocationConfirm"
  />

  <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
    <div class="flex flex-col gap-1">
      <label :for="`${idPrefix}_street`">Calle</label>
      <InputText :id="`${idPrefix}_street`" v-model="form.street" required />
    </div>
    <div class="flex flex-col gap-1">
      <label :for="`${idPrefix}_external_number`">Número exterior</label>
      <InputText :id="`${idPrefix}_external_number`" v-model="form.external_number" required />
    </div>
  </div>

  <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
    <div class="flex flex-col gap-1">
      <label :for="`${idPrefix}_between_a`">Entre calle A</label>
      <InputText :id="`${idPrefix}_between_a`" v-model="form.between_a" required />
    </div>
    <div class="flex flex-col gap-1">
      <label :for="`${idPrefix}_between_b`">Entre calle B</label>
      <InputText :id="`${idPrefix}_between_b`" v-model="form.between_b" required />
    </div>
  </div>

  <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
    <div class="flex flex-col gap-1">
      <label :for="`${idPrefix}_internal_number`">Número interior (opcional)</label>
      <InputText :id="`${idPrefix}_internal_number`" v-model="form.internal_number" />
    </div>
    <div class="flex flex-col gap-1">
      <label :for="`${idPrefix}_postal_code`">Código postal</label>
      <InputText :id="`${idPrefix}_postal_code`" v-model="form.postal_code" required />
    </div>
  </div>

  <div class="flex flex-col gap-1">
    <label :for="`${idPrefix}_notes`">Referencias</label>
    <Textarea :id="`${idPrefix}_notes`" v-model="form.notes" rows="3" required />
  </div>

  <div class="flex items-center gap-2">
    <Checkbox :inputId="`${idPrefix}_is_default`" v-model="form.is_default" binary />
    <label :for="`${idPrefix}_is_default`">Marcar como dirección principal</label>
  </div>
</template>
