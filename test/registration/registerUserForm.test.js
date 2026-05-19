import { expect, test } from 'vitest'

import {
    buildAddressPayload,
    buildUserPayload,
    createRegistrationForm,
    getRegistrationApiErrorMessage,
    getRegistrationFormError
} from '../../src/contexts/registration/utils/registerUserForm.js'

function createValidForm() {
    const form = createRegistrationForm('usuario@example.com')

    form.first_name = 'Juan'
    form.last_name = 'Perez'
    form.phone_number = '(981) 123 4567'
    form.password = 'secret1'
    form.password_confirmation = 'secret1'
    form.address.city_id = 4
    form.address.street = '56'
    form.address.between_a = '57'
    form.address.between_b = '58'
    form.address.external_number = '24'
    form.address.internal_number = ''
    form.address.district = 'Centro'
    form.address.postal_code = '97000'
    form.address.notes = 'Segundo piso'

    return form
}

test('buildUserPayload normalizes the registration payload expected by the backend', () => {
    const form = createValidForm()

    expect(buildUserPayload(form)).toEqual({
        first_name: 'Juan',
        last_name: 'Perez',
        email: 'usuario@example.com',
        phone_number: '9811234567',
        password: 'secret1'
    })
})

test('buildAddressPayload creates the address payload tied to the registered user', () => {
    const form = createValidForm()

    expect(buildAddressPayload(form, 15)).toEqual({
        user_id: 15,
        city_id: 4,
        street: '56',
        between_a: '57',
        between_b: '58',
        external_number: 24,
        internal_number: null,
        district: 'Centro',
        postal_code: '97000',
        notes: 'Segundo piso',
        is_default: true
    })
})

test('getRegistrationFormError rejects mismatched passwords before submitting', () => {
    const form = createValidForm()
    form.password_confirmation = 'different'

    expect(getRegistrationFormError(form)).toBe('Las contrasenas no coinciden.')
})

test('getRegistrationFormError accepts a complete valid form', () => {
    expect(getRegistrationFormError(createValidForm())).toBe('')
})

test('getRegistrationFormError rejects emails longer than the database column', () => {
    const form = createValidForm()
    form.email = 'alejandro.castillo.avilez.30.06.71@gmail.com'

    expect(getRegistrationFormError(form)).toBe('El correo electronico no puede superar 40 caracteres.')
})

test('getRegistrationApiErrorMessage maps backend SQL length errors to a readable message', () => {
    expect(
        getRegistrationApiErrorMessage({
            message: "SQLSTATE[22001]: Data too long for column 'email' at row 1"
        })
    ).toBe('El correo electronico no puede superar 40 caracteres.')
})

test('getRegistrationApiErrorMessage returns the first validation error from Laravel', () => {
    expect(
        getRegistrationApiErrorMessage({
            errors: {
                phone_number: ['El telefono ya esta en uso']
            }
        })
    ).toBe('El telefono ya esta en uso')
})
