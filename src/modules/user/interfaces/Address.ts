export interface Address {
  id: number
  city_id: number
  street: string
  between_a: string
  between_b: string
  external_number: number
  internal_number: number | null
  district: string
  postal_code: string
  notes: string
  is_default: boolean
}

export interface AddressFormData {
  id: number | null
  city_id: number | null
  street: string
  between_a: string
  between_b: string
  external_number: string
  internal_number: string
  district: string
  postal_code: string
  notes: string
  is_default: boolean
}

export interface AddressPayload {
  city_id: number
  street: string
  between_a: string
  between_b: string
  external_number: number
  internal_number: number | null
  district: string
  postal_code: string
  notes: string
}
