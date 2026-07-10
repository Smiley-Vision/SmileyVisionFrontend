import { reactive } from 'vue'

import type { Address } from '@/modules/user/interfaces/Address'
import { buildAddressSearchQuery } from '@/modules/user/utils/address'

import type { useCityCatalog } from './useCityCatalog'

interface Coordinates {
  lat: number
  lon: number
}

export const mapFallbackThumbnail =
  'https://maps.google.com/maps?q=19.833141,-90.521352&z=17&hl=es&output=embed'

export function useAddressMapThumbnails(cityCatalog: ReturnType<typeof useCityCatalog>) {
  const googleMapsEmbedApiKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY as string | undefined

  const addressMapThumbnailById = reactive<Record<number, string>>({})
  const geocodingCacheByQuery = reactive<Record<string, Coordinates>>({})

  function buildMapThumbnailUrl(query: string, location: Coordinates | null): string {
    const resolvedQuery = String(query ?? '').trim()
    const coordinates =
      Number.isFinite(location?.lat) && Number.isFinite(location?.lon)
        ? `${location?.lat},${location?.lon}`
        : ''

    if (googleMapsEmbedApiKey) {
      const params = new URLSearchParams({
        key: googleMapsEmbedApiKey,
        q: resolvedQuery || coordinates || 'San Francisco de Campeche, Campeche, Mexico',
        zoom: '18',
        language: 'es',
        region: 'MX',
      })

      return `https://www.google.com/maps/embed/v1/place?${params.toString()}`
    }

    const params = new URLSearchParams({
      q: coordinates || resolvedQuery || 'San Francisco de Campeche, Campeche, Mexico',
      z: '18',
      hl: 'es',
      output: 'embed',
    })

    return `https://maps.google.com/maps?${params.toString()}`
  }

  async function geocodeAddress(query: string): Promise<Coordinates | null> {
    const cacheKey = String(query).trim().toLowerCase()

    if (geocodingCacheByQuery[cacheKey]) {
      return geocodingCacheByQuery[cacheKey]
    }

    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      countrycodes: 'mx',
      limit: '1',
      extratags: '1',
      'accept-language': 'es-MX,es,en-US,en',
    })

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) return null

    const results = await response.json()
    const firstResult = Array.isArray(results) ? results[0] : null
    const latitude = Number(firstResult?.lat)
    const longitude = Number(firstResult?.lon)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null
    }

    const coordinates = { lat: latitude, lon: longitude }
    geocodingCacheByQuery[cacheKey] = coordinates

    return coordinates
  }

  function getAddressMapThumbnail(address: Address): string {
    return addressMapThumbnailById[address.id] ?? mapFallbackThumbnail
  }

  async function loadAddressMapThumbnails(addressList: Address[]) {
    for (const address of addressList) {
      if (!address?.id || addressMapThumbnailById[address.id]) continue

      const cityName = cityCatalog.resolveCityName(address.city_id)
      const stateName = cityCatalog.resolveStateName(address.city_id)
      const searchQuery = buildAddressSearchQuery(address, cityName, stateName)

      try {
        const coordinates = await geocodeAddress(searchQuery)
        addressMapThumbnailById[address.id] = buildMapThumbnailUrl(searchQuery, coordinates)
      } catch {
        addressMapThumbnailById[address.id] = mapFallbackThumbnail
      }
    }

    const availableIds = new Set(addressList.map((address) => address.id))

    Object.keys(addressMapThumbnailById).forEach((addressId) => {
      if (!availableIds.has(Number(addressId))) {
        delete addressMapThumbnailById[Number(addressId)]
      }
    })
  }

  return {
    getAddressMapThumbnail,
    loadAddressMapThumbnails,
  }
}
