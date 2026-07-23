import { reactive, ref } from 'vue'

import { firstProblemMessage, type ApiProblemDetails } from '@/modules/core/api/apiProblem'
import smileyApi from '@/modules/core/api/smileyApi'

import { registrationRequestSchema } from '../schemas/registrationRequest'

interface RegistrationRequestForm {
  email: string
  message: string
}

type RegistrationRequestField = keyof RegistrationRequestForm

export function useRegistrationRequestForm() {
  const form = reactive<RegistrationRequestForm>({
    email: '',
    message: '',
  })

  const errors = reactive<RegistrationRequestForm>({
    email: '',
    message: '',
  })

  const isSubmitting = ref(false)
  const successMessage = ref('')
  const apiError = ref('')

  function validateForm(): boolean {
    errors.email = ''
    errors.message = ''
    apiError.value = ''

    const result = registrationRequestSchema.safeParse({
      email: form.email.trim(),
      message: form.message.trim(),
    })

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as RegistrationRequestField
        if (!errors[field]) {
          errors[field] = issue.message
        }
      }
    }

    return result.success
  }

  async function submit(): Promise<boolean> {
    successMessage.value = ''

    if (!validateForm()) {
      return false
    }

    isSubmitting.value = true

    try {
      await smileyApi.post('registration-applications', {
        email: form.email.trim(),
        message: form.message.trim(),
      })

      successMessage.value =
        'Solicitud enviada correctamente. Nuestro equipo revisará la información de tu óptica.'
      resetForm()
      return true
    } catch (error) {
      apiError.value = firstProblemMessage(error as ApiProblemDetails) || 'No se pudo enviar la solicitud.'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  function resetForm() {
    form.email = ''
    form.message = ''
  }

  function clearFeedback(field: RegistrationRequestField) {
    errors[field] = ''
    apiError.value = ''
  }

  return {
    apiError,
    clearFeedback,
    errors,
    form,
    isSubmitting,
    submit,
    successMessage,
  }
}
