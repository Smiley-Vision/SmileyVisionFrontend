<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { firstProblemMessage, type ApiProblemDetails } from '@/modules/core/api/apiProblem'
import smileyApi from '@/modules/core/api/smileyApi'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import type { AuthUser } from '@/modules/core/interfaces/AuthUser'
import { useAuthStore } from '@/modules/core/stores/auth'
import AddressFormFields from '@/modules/user/components/AddressFormFields.vue'
import { useCityCatalog } from '@/modules/user/composables/useCityCatalog'
import { createAddressService } from '@/modules/user/services/profileService'

import { registrationFormSchema, type RegistrationFormValues } from '../schemas/registrationForm'
import { buildSignUpPayload, createRegistrationInitialValues } from '../utils/registrationUserForm'

interface SignUpResponse {
  message: string
  data: {
    user: AuthUser
    token: string
  }
}

const auth = useAuthStore()
const notify = useAppToast()
const router = useRouter()
const route = useRoute()
const { cityOptions } = useCityCatalog()

const resolver = zodResolver(registrationFormSchema)

const invitationEmail = typeof route.query.email === 'string' ? route.query.email : ''
const invitationToken = typeof route.query.token === 'string' ? route.query.token : ''
const isEmailFromInvitation = computed(() => invitationEmail.length > 0)

const initialValues = createRegistrationInitialValues({
  registrationToken: invitationToken,
  email: invitationEmail,
})

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return

  const values = event.values as RegistrationFormValues
  const {
    registration_token: _registrationToken,
    first_name: _firstName,
    last_name: _lastName,
    email: _email,
    phone_number: _phoneNumber,
    password: _password,
    password_confirmation: _passwordConfirmation,
    ...addressValues
  } = values

  try {
    const signUpResponse = (
      await smileyApi.post<SignUpResponse>('signup', buildSignUpPayload(values))
    ).data
    const { user, token } = signUpResponse.data

    // Sign the user in so the address can be created on their behalf
    auth.setSession(token, user)

    try {
      await createAddressService(addressValues)
    } catch (addressError) {
      notify(
        'error',
        'Error',
        `No se pudo guardar tu dirección: ${firstProblemMessage(addressError as ApiProblemDetails)}`,
      )
    }

    notify('success', 'Éxito', `Registro exitoso. Bienvenido, ${user.first_name}`)
    router.push({ name: 'home' })
  } catch (error) {
    notify('error', 'Error', firstProblemMessage(error as ApiProblemDetails))
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
      <Form
        v-slot="$form"
        class="flex flex-col gap-5 border-t border-slate-200 px-6 py-8 sm:px-10"
        :resolver="resolver"
        :initial-values="initialValues"
        @submit="handleSubmit"
      >
        <div class="flex flex-col gap-2">
          <label for="registration_token" class="font-semibold text-slate-800"
            >Token de registro</label
          >
          <InputText
            id="registration_token"
            name="registration_token"
            placeholder="Ingrese el token enviado a su correo"
          />
          <Message v-if="$form.registration_token?.invalid" severity="error" size="small">
            {{ $form.registration_token.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="first_name" class="font-semibold text-slate-800">Nombres</label>
          <InputText id="first_name" name="first_name" placeholder="Ingrese sus nombres" />
          <Message v-if="$form.first_name?.invalid" severity="error" size="small">
            {{ $form.first_name.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="last_name" class="font-semibold text-slate-800">Apellidos</label>
          <InputText id="last_name" name="last_name" placeholder="Ingrese sus apellidos" />
          <Message v-if="$form.last_name?.invalid" severity="error" size="small">
            {{ $form.last_name.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="email" class="font-semibold text-slate-800">Correo Electrónico</label>
          <InputText
            id="email"
            name="email"
            :disabled="isEmailFromInvitation"
            placeholder="Ingrese su correo electrónico"
          />
          <Message v-if="$form.email?.invalid" severity="error" size="small">
            {{ $form.email.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="phone_number" class="font-semibold text-slate-800">Teléfono</label>
          <InputText id="phone_number" name="phone_number" placeholder="10 dígitos (opcional)" />
          <Message v-if="$form.phone_number?.invalid" severity="error" size="small">
            {{ $form.phone_number.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="password" class="font-semibold text-slate-800">Contraseña</label>
          <Password
            id="password"
            name="password"
            placeholder="Mínimo 6 caracteres"
            :feedback="false"
            toggle-mask
            fluid
          />
          <Message v-if="$form.password?.invalid" severity="error" size="small">
            {{ $form.password.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="password_confirmation" class="font-semibold text-slate-800"
            >Confirmar contraseña</label
          >
          <Password
            id="password_confirmation"
            name="password_confirmation"
            placeholder="Repita su contraseña"
            :feedback="false"
            toggle-mask
            fluid
          />
          <Message v-if="$form.password_confirmation?.invalid" severity="error" size="small">
            {{ $form.password_confirmation.error?.message }}
          </Message>
        </div>

        <fieldset class="flex flex-col gap-4 border-t border-slate-200 pt-6">
          <legend class="mb-2 font-semibold text-slate-800">Ubicación</legend>

          <AddressFormFields
            :city-options="cityOptions"
            id-prefix="signup"
            :show-default-option="false"
          />
        </fieldset>

        <div class="pt-2">
          <Button type="submit" label="Registrarse" class="w-full" size="large" />
        </div>
      </Form>
    </div>
  </div>

  <Toast position="bottom-right" />
</template>
