import type { RegistrationFormValues } from '@/modules/registration/schemas/registrationForm'

export interface RegistrationFormData {
  registration_token: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  password: string
  password_confirmation: string
  city_id: number | null
  street: string
  between_a: string
  between_b: string
  external_number: string
  internal_number: string
  district: string
  postal_code: string
  notes: string
  latitude: number | null
  longitude: number | null
}

export interface SignUpPayload {
  registration_token: string
  first_name: string
  last_name: string
  email: string
  phone_number?: number
  password: string
}

export function createRegistrationInitialValues(seed?: {
  registrationToken?: string
  email?: string
}): RegistrationFormData {
  return {
    registration_token: seed?.registrationToken ?? '',
    first_name: '',
    last_name: '',
    email: seed?.email ?? '',
    phone_number: '',
    password: '',
    password_confirmation: '',
    city_id: null,
    street: '',
    between_a: '',
    between_b: '',
    external_number: '',
    internal_number: '',
    district: '',
    postal_code: '',
    notes: '',
    latitude: null,
    longitude: null,
  }
}

// Maps the validated form onto the API's SignUpRequest schema
export function buildSignUpPayload(values: RegistrationFormValues): SignUpPayload {
  const payload: SignUpPayload = {
    registration_token: values.registration_token,
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    password: values.password,
  }

  if (values.phone_number) {
    payload.phone_number = Number(values.phone_number)
  }

  return payload
}
