import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { firstProblemMessage, type ApiProblemDetails } from '@/modules/core/api/apiProblem'
import smileyApi from '@/modules/core/api/smileyApi'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import { useAuthStore } from '@/modules/core/stores/auth'
import { createAddressService } from '@/modules/user/services/profileService'

import type { SignUpResponse } from '../interfaces/SignUpResponse'
import type { RegistrationFormValues } from '../schemas/registrationForm'
import { buildSignUpPayload } from '../utils/registrationUserForm'

export function useSignUpSubmit() {
  const auth = useAuthStore()
  const notify = useAppToast()
  const router = useRouter()

  const isSubmitting = ref(false)

  async function submitSignUp(values: RegistrationFormValues) {
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

    isSubmitting.value = true

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
    } finally {
      isSubmitting.value = false
    }
  }

  return { isSubmitting, submitSignUp }
}
