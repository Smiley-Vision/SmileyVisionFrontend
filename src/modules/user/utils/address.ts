import type { Address, AddressFormData } from '@/modules/user/interfaces/Address'

export function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1'
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function normalizeAddress(address: Address): Address {
  return {
    ...address,
    is_default: toBoolean(address?.is_default),
    latitude: toNullableNumber(address?.latitude),
    longitude: toNullableNumber(address?.longitude),
  }
}

export function sortAddresses(list: Address[]): Address[] {
  return [...list].sort((a, b) => {
    const defaultPriority = Number(b.is_default) - Number(a.is_default)

    if (defaultPriority !== 0) return defaultPriority

    return Number(b.id) - Number(a.id)
  })
}

export function extractAddressList(response: { data?: Address[] } | null | undefined): Address[] {
  return Array.isArray(response?.data) ? response.data : []
}

export function createEmptyAddressForm(): AddressFormData {
  return {
    id: null,
    city_id: null,
    street: '',
    between_a: '',
    between_b: '',
    external_number: '',
    internal_number: '',
    district: '',
    postal_code: '',
    notes: '',
    is_default: false,
    latitude: null,
    longitude: null,
  }
}

export function addressToFormData(address: Address): AddressFormData {
  return {
    ...createEmptyAddressForm(),
    ...address,
    external_number: String(address.external_number ?? ''),
    internal_number: address.internal_number === null ? '' : String(address.internal_number),
    is_default: !!address.is_default,
  }
}

export function formatAddressLine(address: Address): string {
  return `Calle ${address.street}, Colonia ${address.district}`
}

/**
 * Builds geocoding search queries from most to least specific. Some Mexican postal
 * codes have sparse OpenStreetMap coverage, so a fully-specific query can fail to
 * geocode even though the address itself is valid; falling back to progressively
 * broader queries keeps the map centered near the real address instead of jumping
 * straight to the generic fallback thumbnail.
 */
export function buildAddressSearchQueryCandidates(
  address: Address,
  cityName: string,
  stateName: string,
): string[] {
  const street = String(address.street ?? '').trim()
  const number = String(address.external_number ?? '').trim()
  const betweenA = String(address.between_a ?? '').trim()
  const betweenB = String(address.between_b ?? '').trim()
  const district = String(address.district ?? '').trim()
  const postalCode = String(address.postal_code ?? '').trim()
  const betweenLabel = betweenA && betweenB ? ` entre Calle ${betweenA} y Calle ${betweenB}` : ''
  const streetWithNumber = street
    ? `Calle ${street}${number ? ` #${number}` : ''}${betweenLabel}`
    : ''
  const districtLabel = district ? `Colonia ${district}` : ''

  const candidateParts = [
    [cityName, stateName, streetWithNumber, districtLabel, postalCode, 'Mexico'],
    [cityName, stateName, streetWithNumber, districtLabel, 'Mexico'],
    [cityName, stateName, districtLabel, postalCode, 'Mexico'],
    [cityName, stateName, districtLabel, 'Mexico'],
    [cityName, stateName, 'Mexico'],
  ]

  const queries = candidateParts.map((parts) => parts.filter(Boolean).join(', '))

  return queries.filter((query, index) => query && queries.indexOf(query) === index)
}
