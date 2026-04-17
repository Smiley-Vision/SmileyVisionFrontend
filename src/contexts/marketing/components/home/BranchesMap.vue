<script setup>
import L from 'leaflet';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const branches = [
    { name: 'Ciudad de México', coordinates: [19.4326, -99.1332] },
    { name: 'Mérida', coordinates: [20.9674, -89.5926] },
    { name: 'Campeche', coordinates: [19.8301, -90.5349] }
]

const mapElement = ref(null)
let map = null

const markerIcon = L.divIcon({
    className: 'sv-branch-marker',
    html: '<span class="sv-branch-marker__pin"></span>',
    iconSize: [28, 40],
    iconAnchor: [14, 38],
    popupAnchor: [0, -30]
})

onMounted(() => {
    if (!mapElement.value) return

    map = L.map(mapElement.value, {
        zoomControl: true,
        scrollWheelZoom: false
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const bounds = []

    branches.forEach((branch) => {
        L.marker(branch.coordinates, { icon: markerIcon })
            .addTo(map)
            .bindPopup(branch.name, { closeButton: false })

        bounds.push(branch.coordinates)
    })

    map.fitBounds(bounds, {
        padding: [30, 30]
    })

    requestAnimationFrame(() => {
        map?.invalidateSize()
    })
})

onBeforeUnmount(() => {
    map?.remove()
    map = null
})
</script>

<template>
    <div ref="mapElement" class="branch-map h-[360px] w-full rounded-[1.75rem] sm:h-[420px]"></div>
</template>

<style scoped>
.branch-map :deep(.leaflet-control-zoom) {
    border: none;
    box-shadow: 0 12px 24px rgba(15, 76, 129, 0.16);
}

.branch-map :deep(.leaflet-control-zoom a) {
    color: #0c5e89;
}

.branch-map :deep(.leaflet-popup-content-wrapper),
.branch-map :deep(.leaflet-popup-tip) {
    background: #0c5e89;
    color: white;
}

.branch-map :deep(.leaflet-popup-content) {
    margin: 10px 14px;
    font-weight: 600;
}

.branch-map :deep(.sv-branch-marker) {
    background: transparent;
    border: none;
}

.branch-map :deep(.sv-branch-marker__pin) {
    position: relative;
    display: block;
    width: 28px;
    height: 28px;
    border-radius: 9999px 9999px 9999px 0;
    background: linear-gradient(180deg, #38bdf8 0%, #0c5e89 100%);
    transform: rotate(-45deg);
    box-shadow: 0 12px 28px rgba(12, 94, 137, 0.28);
}

.branch-map :deep(.sv-branch-marker__pin::after) {
    content: "";
    position: absolute;
    inset: 7px;
    border-radius: 9999px;
    background: white;
}
</style>
