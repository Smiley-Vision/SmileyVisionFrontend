import type { Address, AddressFormData, AddressPayload } from '@/modules/user/interfaces/Address'

export function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1'
}

export function normalizeAddress(address: Address): Address {
  return {
    ...address,
    is_default: toBoolean(address?.is_default),
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

export function buildAddressPayload(formData: AddressFormData): AddressPayload {
  return {
    city_id: Number(formData.city_id),
    street: String(formData.street).trim(),
    between_a: String(formData.between_a).trim(),
    between_b: String(formData.between_b).trim(),
    external_number: Number(formData.external_number),
    internal_number: formData.internal_number === '' ? null : Number(formData.internal_number),
    district: String(formData.district).trim(),
    postal_code: String(formData.postal_code).trim(),
    notes: String(formData.notes).trim(),
  }
}

export function formatAddressLine(address: Address): string {
  return `Calle ${address.street}, Colonia ${address.district}`
}

export function buildAddressSearchQuery(
  address: Address,
  cityName: string,
  stateName: string,
): string {
  const street = String(address.street ?? '').trim()
  const number = String(address.external_number ?? '').trim()
  const district = String(address.district ?? '').trim()
  const postalCode = String(address.postal_code ?? '').trim()
  const streetWithNumber = street ? `Calle ${street}${number ? ` #${number}` : ''}` : ''
  const districtLabel = district ? `Colonia ${district}` : ''

  return [cityName, stateName, streetWithNumber, districtLabel, postalCode, 'Mexico']
    .filter(Boolean)
    .join(', ')
}
