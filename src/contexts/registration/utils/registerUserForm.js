export const registrationCityOptions = [
    { label: 'Ciudad de Mexico', value: 2 },
    { label: 'Merida', value: 4 },
    { label: 'San Francisco de Campeche', value: 1 },
    { label: 'Villahermosa', value: 3 }
]

const fieldLabels = {
    email: 'correo electronico',
    first_name: 'nombres',
    last_name: 'apellidos',
    phone_number: 'telefono',
    password: 'contrasena'
}

export function createRegistrationForm(email = '') {
    return {
        first_name: '',
        last_name: '',
        email,
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
            notes: ''
        }
    }
}

export function buildUserPayload(form) {
    return {
        first_name: String(form.first_name).trim(),
        last_name: String(form.last_name).trim(),
        email: String(form.email).trim(),
        phone_number: String(form.phone_number).replace(/\D/g, ''),
        password: form.password
    }
}

export function buildAddressPayload(form, userId) {
    const address = form.address

    return {
        user_id: Number(userId),
        city_id: Number(address.city_id),
        street: String(address.street).trim(),
        between_a: String(address.between_a).trim(),
        between_b: String(address.between_b).trim(),
        external_number: Number(address.external_number),
        internal_number: address.internal_number === '' ? null : Number(address.internal_number),
        district: String(address.district).trim(),
        postal_code: String(address.postal_code).trim(),
        notes: String(address.notes).trim(),
        is_default: true
    }
}

export function getRegistrationFormError(form) {
    const userPayload = buildUserPayload(form)
    const address = form.address

    if (!userPayload.first_name || !userPayload.last_name || !userPayload.email) {
        return 'Llene todos los campos personales.'
    }

    if (userPayload.first_name.length > 20) {
        return 'Los nombres no pueden superar 20 caracteres.'
    }

    if (userPayload.last_name.length > 20) {
        return 'Los apellidos no pueden superar 20 caracteres.'
    }

    if (userPayload.email.length > 40) {
        return 'El correo electronico no puede superar 40 caracteres.'
    }

    if (userPayload.phone_number.length !== 10) {
        return 'El telefono debe tener 10 digitos.'
    }

    if (!form.password || !form.password_confirmation) {
        return 'Ingrese y confirme su contrasena.'
    }

    if (form.password !== form.password_confirmation) {
        return 'Las contrasenas no coinciden.'
    }

    if (String(form.password).length < 6) {
        return 'La contrasena debe tener al menos 6 caracteres.'
    }

    if (!address.city_id || !address.street || !address.between_a || !address.between_b) {
        return 'Complete los datos de ubicacion.'
    }

    if (!address.external_number || !address.district || !address.postal_code || !address.notes) {
        return 'Complete los datos de ubicacion.'
    }

    return ''
}

export function getRegistrationApiErrorMessage(error) {
    const firstValidationError = getFirstValidationError(error?.errors)

    if (firstValidationError) {
        return firstValidationError
    }

    const rawMessage = String(error?.message || error?.error || error || '')

    if (rawMessage.includes("Data too long for column 'email'")) {
        return 'El correo electronico no puede superar 40 caracteres.'
    }

    const tooLongField = rawMessage.match(/Data too long for column '([^']+)'/)

    if (tooLongField?.[1]) {
        const label = fieldLabels[tooLongField[1]] ?? tooLongField[1]
        return `El campo ${label} es demasiado largo.`
    }

    if (rawMessage && !rawMessage.includes('[object Object]')) {
        return rawMessage
    }

    return 'No se pudo completar el registro.'
}

function getFirstValidationError(errors) {
    if (!errors || typeof errors !== 'object') {
        return ''
    }

    const firstField = Object.keys(errors)[0]
    const firstError = errors[firstField]

    if (Array.isArray(firstError)) {
        return firstError[0] ?? ''
    }

    return String(firstError || '')
}
