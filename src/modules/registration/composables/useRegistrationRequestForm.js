import { reactive, ref } from 'vue'
import { createRegistrationRequestService } from '../services/registrationService'
import { normalizeApiError } from '@/modules/core/utils/normalizeApiError.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useRegistrationRequestForm() {
  const form = reactive({
    email: '',
    message: '',
  })

  const errors = reactive({
    email: '',
    message: '',
  })

  const isSubmitting = ref(false)
  const successMessage = ref('')
  const apiError = ref('')

  function validateForm() {
    errors.email = ''
    errors.message = ''
    apiError.value = ''

    const email = form.email.trim()
    const message = form.message.trim()

    if (!email) {
      errors.email = 'El correo electrónico es obligatorio.'
    } else if (!emailPattern.test(email)) {
      errors.email = 'Ingresa un correo electrónico válido.'
    }

    if (!message) {
      errors.message = 'La descripción de tu negocio es obligatoria.'
    }

    return !errors.email && !errors.message
  }

  async function submit() {
    successMessage.value = ''

    if (!validateForm()) {
      return false
    }

    isSubmitting.value = true

    try {
      await createRegistrationRequestService({
        email: form.email.trim(),
        message: form.message.trim(),
      })

      successMessage.value =
        'Solicitud enviada correctamente. Nuestro equipo revisará la información de tu óptica.'
      resetForm()
      return true
    } catch (error) {
      apiError.value = normalizeApiError(error) || 'No se pudo enviar la solicitud.'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  function resetForm() {
    form.email = ''
    form.message = ''
  }

  function clearFeedback(field) {
    if (field === 'email') errors.email = ''
    if (field === 'message') errors.message = ''
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
