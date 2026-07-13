<script setup lang="ts">
import L from 'leaflet'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { ref } from 'vue'

import { getCityCenter } from '@/modules/user/constants/cityCenters'

interface LocationConfirmPayload {
  latitude: number
  longitude: number
  street?: string
  district?: string
  postal_code?: string
}

const props = defineProps<{
  visible: boolean
  cityId: number | null
  initialLatitude: number | null
  initialLongitude: number | null
  initialStreet: string
  initialDistrict: string
  initialPostalCode: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [payload: LocationConfirmPayload]
}>()

const mapElement = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

const pickedLat = ref<number | null>(null)
const pickedLng = ref<number | null>(null)
const isLocating = ref(false)
const suggestedStreet = ref('')
const suggestedDistrict = ref('')
const suggestedPostalCode = ref('')

const markerIcon = L.divIcon({
  className: 'sv-location-marker',
  html: '<span class="sv-location-marker__pin"></span>',
  iconSize: [28, 40],
  iconAnchor: [14, 38],
})

async function reverseGeocode(lat: number, lng: number) {
  suggestedStreet.value = ''
  suggestedDistrict.value = ''
  suggestedPostalCode.value = ''
  isLocating.value = true

  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'jsonv2',
      'accept-language': 'es-MX,es,en-US,en',
    })

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      { headers: { Accept: 'application/json' } },
    )

    if (!response.ok) return

    const result = await response.json()
    const details = result?.address ?? {}

    suggestedStreet.value = String(details.road ?? '').trim()
    suggestedDistrict.value = String(
      details.suburb ?? details.neighbourhood ?? details.quarter ?? '',
    ).trim()
    suggestedPostalCode.value = String(details.postcode ?? '').trim()
  } catch {
    // Best-effort suggestion only; the picked pin stays valid either way.
  } finally {
    isLocating.value = false
  }
}

function setPickedLocation(lat: number, lng: number) {
  pickedLat.value = lat
  pickedLng.value = lng
  void reverseGeocode(lat, lng)
}

function initMap() {
  if (!mapElement.value) return

  const hasExistingPin =
    Number.isFinite(props.initialLatitude) && Number.isFinite(props.initialLongitude)
  const center = hasExistingPin
    ? { lat: props.initialLatitude as number, lng: props.initialLongitude as number }
    : getCityCenter(props.cityId)

  map = L.map(mapElement.value, { zoomControl: true }).setView([center.lat, center.lng], 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  marker = L.marker([center.lat, center.lng], { icon: markerIcon, draggable: true }).addTo(map)

  marker.on('dragend', () => {
    const position = marker?.getLatLng()
    if (position) setPickedLocation(position.lat, position.lng)
  })

  map.on('click', (event: L.LeafletMouseEvent) => {
    marker?.setLatLng(event.latlng)
    setPickedLocation(event.latlng.lat, event.latlng.lng)
  })

  pickedLat.value = center.lat
  pickedLng.value = center.lng

  requestAnimationFrame(() => map?.invalidateSize())

  if (hasExistingPin) {
    void reverseGeocode(center.lat, center.lng)
  }
}

function destroyMap() {
  map?.remove()
  map = null
  marker = null
}

function handleConfirm() {
  if (pickedLat.value === null || pickedLng.value === null) return

  const payload: LocationConfirmPayload = {
    latitude: pickedLat.value,
    longitude: pickedLng.value,
  }

  if (!props.initialStreet.trim() && suggestedStreet.value) {
    payload.street = suggestedStreet.value
  }

  if (!props.initialDistrict.trim() && suggestedDistrict.value) {
    payload.district = suggestedDistrict.value
  }

  if (!props.initialPostalCode.trim() && suggestedPostalCode.value) {
    payload.postal_code = suggestedPostalCode.value
  }

  emit('confirm', payload)
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :style="{ width: '36rem' }"
    @update:visible="$emit('update:visible', $event)"
    @show="initMap"
    @hide="destroyMap"
  >
    <template #header>
      <div class="text-[#075985] font-semibold">Ubicar en el mapa</div>
    </template>

    <div ref="mapElement" class="h-[360px] w-full rounded-xl overflow-hidden"></div>

    <p class="text-sm text-slate-600 mt-3">
      Arrastra el pin o haz clic en el mapa para ubicar tu dirección.
    </p>

    <p v-if="isLocating" class="text-sm text-slate-500 mt-2">
      Buscando sugerencia de dirección...
    </p>
    <p
      v-else-if="suggestedStreet || suggestedDistrict || suggestedPostalCode"
      class="text-sm text-slate-600 mt-2"
    >
      Sugerencia: {{ [suggestedStreet, suggestedDistrict, suggestedPostalCode].filter(Boolean).join(', ') }}
    </p>

    <div class="flex justify-end gap-3 mt-4">
      <Button
        type="button"
        label="Cancelar"
        severity="secondary"
        text
        @click="$emit('update:visible', false)"
      />
      <Button type="button" label="Confirmar ubicación" @click="handleConfirm" />
    </div>
  </Dialog>
</template>

<style scoped>
:deep(.sv-location-marker) {
  background: transparent;
  border: none;
}

:deep(.sv-location-marker__pin) {
  position: relative;
  display: block;
  width: 28px;
  height: 28px;
  border-radius: 9999px 9999px 9999px 0;
  background: linear-gradient(180deg, #38bdf8 0%, #0c5e89 100%);
  transform: rotate(-45deg);
  box-shadow: 0 12px 28px rgba(12, 94, 137, 0.28);
}

:deep(.sv-location-marker__pin::after) {
  content: '';
  position: absolute;
  inset: 7px;
  border-radius: 9999px;
  background: white;
}
</style>
