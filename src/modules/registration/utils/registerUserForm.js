export const registrationCityOptions = [
  { label: 'Ciudad de Mexico', value: 2 },
  { label: 'Merida', value: 4 },
  { label: 'San Francisco de Campeche', value: 1 },
  { label: 'Villahermosa', value: 3 },
]

export function createRegistrationForm() {
  return {
    registration_token: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
    address: {
      city_id: null,
      street: '',
      between_a: '',
      between_b: '',
      external_number: '',
      internal_number: '',
      district: '',
      postal_code: '',
      notes: '',
    },
  }
}

// Maps the form onto the API's SignUpRequest schema
export function buildSignUpPayload(form) {
  const payload = {
    registration_token: String(form.registration_token).trim(),
    first_name: String(form.first_name).trim(),
    last_name: String(form.last_name).trim(),
    email: String(form.email).trim(),
    password: form.password,
  }

  const phoneDigits = String(form.phone_number).replace(/\D/g, '')

  if (phoneDigits) {
    payload.phone_number = Number(phoneDigits)
  }

  return payload
}

// Maps the form onto the API's StoreAddressRequest schema
export function buildAddressPayload(form) {
  const address = form.address

  return {
    city_id: Number(address.city_id),
    street: String(address.street).trim(),
    between_a: String(address.between_a).trim(),
    between_b: String(address.between_b).trim(),
    external_number: Number(address.external_number),
    internal_number: address.internal_number === '' ? null : Number(address.internal_number),
    district: String(address.district).trim(),
    postal_code: String(address.postal_code).trim(),
    notes: String(address.notes).trim(),
  }
}

export function getRegistrationFormError(form) {
  if (!String(form.registration_token).trim()) {
    return 'El token de registro es obligatorio.'
  }

  const signUpPayload = buildSignUpPayload(form)

  if (signUpPayload.first_name.length < 3 || signUpPayload.first_name.length > 25) {
    return 'Los nombres deben tener entre 3 y 25 caracteres.'
  }

  if (signUpPayload.last_name.length < 3 || signUpPayload.last_name.length > 25) {
    return 'Los apellidos deben tener entre 3 y 25 caracteres.'
  }

  if (!signUpPayload.email || signUpPayload.email.length > 80) {
    return 'Ingrese un correo electrónico válido de máximo 80 caracteres.'
  }

  if (!form.password || !form.password_confirmation) {
    return 'Ingrese y confirme su contraseña.'
  }

  if (form.password !== form.password_confirmation) {
    return 'Las contraseñas no coinciden.'
  }

  if (String(form.password).length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }

  const address = form.address

  if (!address.city_id || !address.street || !address.between_a || !address.between_b) {
    return 'Complete los datos de ubicación.'
  }

  if (!address.external_number || !address.district || !address.postal_code || !address.notes) {
    return 'Complete los datos de ubicación.'
  }

  return ''
}
