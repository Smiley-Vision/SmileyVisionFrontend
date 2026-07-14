<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { firstProblemMessage } from '@/modules/core/api/apiProblem'
import api from '@/modules/core/api/smileyApi'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import { useAuthStore } from '@/modules/core/stores/auth'

import {
  buildAddressPayload,
  buildSignUpPayload,
  createRegistrationForm,
  getRegistrationFormError,
  registrationCityOptions,
} from '../utils/registerUserForm'

const auth = useAuthStore()
const notify = useAppToast()
const router = useRouter()

const form = reactive(createRegistrationForm())

// Submit the registration form
const submitRegistration = async () => {
  try {
    const validationMessage = getRegistrationFormError(form)

    if (validationMessage) {
      notify('error', 'Error', validationMessage)
      return
    }

    const signUpResponse = (await api.post('signup', buildSignUpPayload(form))).data
    const { user, token } = signUpResponse.data

    // Sign the user in so the address can be created on their behalf
    auth.setSession(token, user)

    try {
      await api.post('addresses', buildAddressPayload(form))
    } catch (addressError) {
      notify('error', 'Error', `No se pudo guardar tu dirección: ${firstProblemMessage(addressError)}`)
    }

    notify('success', 'Éxito', `Registro exitoso. Bienvenido, ${user.first_name}`)
    router.push({ name: 'home' })
  } catch (error) {
    notify('error', 'Error', firstProblemMessage(error))
  }
}
</script>

<template>
  <div class="flex items-center justify-center bg-slate-100 px-4 py-12">
    <div
      class="w-full max-w-2xl overflow-hidden rounded-lg border border-sky-100 bg-white shadow-xl"
    >
      <!-- Encabezado -->
      <div class="px-6 py-8 sm:px-10">
        <h1 class="text-3xl font-bold text-sky-900">Registro en el sistema</h1>
        <p class="mt-3 text-base leading-7 text-slate-600">
          Ingresa el token de registro que te enviamos por correo y llena correctamente el
          siguiente formulario para poder realizar acciones en el sistema.
        </p>
      </div>

      <!-- Formulario -->
      <form
        @submit.prevent="submitRegistration"
        class="flex flex-col gap-5 border-t border-slate-200 px-6 py-8 sm:px-10"
      >
        <div class="flex flex-col gap-2">
          <label for="registration_token" class="font-semibold text-slate-800"
            >Token de registro</label
          >
          <input
            v-model="form.registration_token"
            type="text"
            id="registration_token"
            name="registration_token"
            class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ingrese el token enviado a su correo"
            required
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="first_name" class="font-semibold text-slate-800">Nombres</label>
          <input
            v-model="form.first_name"
            type="text"
            id="first_name"
            name="first_name"
            class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ingrese sus nombres"
            required
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="last_name" class="font-semibold text-slate-800">Apellidos</label>
          <input
            v-model="form.last_name"
            type="text"
            id="last_name"
            name="last_name"
            class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ingrese sus apellidos"
            required
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="email" class="font-semibold text-slate-800">Correo Electrónico</label>
          <input
            v-model="form.email"
            type="email"
            id="email"
            name="email"
            class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ingrese su correo electrónico"
            required
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="phone" class="font-semibold text-slate-800">Teléfono</label>
          <input
            v-model="form.phone_number"
            type="tel"
            id="phone"
            name="phone"
            inputmode="numeric"
            class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="10 dígitos"
            required
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="password" class="font-semibold text-slate-800">Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            id="password"
            name="password"
            class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="password_confirmation" class="font-semibold text-slate-800"
            >Confirmar contraseña</label
          >
          <input
            v-model="form.password_confirmation"
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Repita su contraseña"
            required
          />
        </div>

        <fieldset class="flex flex-col gap-4 border-t border-slate-200 pt-6">
          <legend class="mb-2 font-semibold text-slate-800">Ubicación</legend>

          <div class="flex flex-col gap-2">
            <label for="city_id" class="font-medium text-slate-700">Ciudad</label>
            <select
              v-model="form.address.city_id"
              id="city_id"
              name="city_id"
              class="w-full rounded-md border border-slate-300 bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            >
              <option :value="null" disabled>Seleccione una ciudad</option>
              <option v-for="city in registrationCityOptions" :key="city.value" :value="city.value">
                {{ city.label }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-2">
            <label for="district" class="font-medium text-slate-700">Colonia</label>
            <input
              v-model="form.address.district"
              type="text"
              id="district"
              name="district"
              class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="street" class="font-medium text-slate-700">Calle</label>
            <input
              v-model="form.address.street"
              type="text"
              id="street"
              name="street"
              class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="external_number" class="font-medium text-slate-700">Número exterior</label>
            <input
              v-model="form.address.external_number"
              type="number"
              id="external_number"
              name="external_number"
              class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="internal_number" class="font-medium text-slate-700">Número interior</label>
            <input
              v-model="form.address.internal_number"
              type="number"
              id="internal_number"
              name="internal_number"
              class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Opcional"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="between_a" class="font-medium text-slate-700">Entre calle A</label>
            <input
              v-model="form.address.between_a"
              type="text"
              id="between_a"
              name="between_a"
              class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="between_b" class="font-medium text-slate-700">Entre calle B</label>
            <input
              v-model="form.address.between_b"
              type="text"
              id="between_b"
              name="between_b"
              class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="postal_code" class="font-medium text-slate-700">Código postal</label>
            <input
              v-model="form.address.postal_code"
              type="text"
              id="postal_code"
              name="postal_code"
              inputmode="numeric"
              class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="notes" class="font-medium text-slate-700">Referencias</label>
            <textarea
              v-model="form.address.notes"
              id="notes"
              name="notes"
              rows="3"
              class="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            ></textarea>
          </div>
        </fieldset>

        <div class="pt-2">
          <button
            type="submit"
            class="w-full rounded-md bg-sky-600 py-3 text-lg font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Registrarse
          </button>
        </div>
      </form>
    </div>
  </div>

  <Toast position="bottom-right" />
</template>
