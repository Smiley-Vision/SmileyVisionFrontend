import { computed, reactive, ref } from 'vue'

import {
  batchCreateLensItemsService,
  getMicasProductsService,
} from '@/modules/admin-products/services/adminProductsService'
import { normalizeApiError } from '@/modules/core/utils/normalizeApiError'

const STEP_CENTS = 25

function parseToCents(value) {
  const normalized = String(value ?? '')
    .trim()
    .replace(',', '.')

  if (normalized === '') return null

  const number = Number(normalized)

  if (!Number.isFinite(number)) return null

  const cents = Math.round(number * 100)

  return cents
}

function centsToDecimal(cents) {
  return Number((cents / 100).toFixed(2))
}

export function useBatchLensesCreation(toast) {
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const micasProducts = ref([])
  const batchResult = ref(null)

  const form = reactive({
    productId: null,
    sphereMin: '-6.00',
    sphereMax: '6.00',
    cylinderMin: '0.00',
    cylinderMax: '-6.00',
  })

  function resetForm() {
    const firstProductId = micasProducts.value[0]?.id ?? null

    form.productId = firstProductId
    form.sphereMin = '-6.00'
    form.sphereMax = '6.00'
    form.cylinderMin = '0.00'
    form.cylinderMax = '-6.00'
  }

  const validation = computed(() => {
    const errors = []

    if (!form.productId) {
      errors.push('Selecciona un producto base de lentes')
    }

    const sphereMinCents = parseToCents(form.sphereMin)
    const sphereMaxCents = parseToCents(form.sphereMax)
    const cylinderMinCents = parseToCents(form.cylinderMin)
    const cylinderMaxCents = parseToCents(form.cylinderMax)

    if (sphereMinCents === null || sphereMaxCents === null) {
      errors.push('Esfera: captura valores numericos validos')
    }

    if (cylinderMinCents === null || cylinderMaxCents === null) {
      errors.push('Cilindro: captura valores numericos validos')
    }

    if (sphereMinCents !== null && sphereMaxCents !== null) {
      if (sphereMinCents < -600 || sphereMaxCents > 600) {
        errors.push('Esfera: el rango permitido es de -6.00 a 6.00')
      }

      if (sphereMinCents > sphereMaxCents) {
        errors.push('Esfera: el valor inicial debe ser menor o igual al valor final')
      }

      if (sphereMinCents % STEP_CENTS !== 0 || sphereMaxCents % STEP_CENTS !== 0) {
        errors.push('Esfera: los valores deben avanzar en pasos de 0.25')
      }
    }

    if (cylinderMinCents !== null && cylinderMaxCents !== null) {
      if (
        cylinderMinCents < -600 ||
        cylinderMinCents > 0 ||
        cylinderMaxCents < -600 ||
        cylinderMaxCents > 0
      ) {
        errors.push('Cilindro: el rango permitido es de 0.00 a -6.00')
      }

      if (cylinderMaxCents > cylinderMinCents) {
        errors.push('Cilindro: el valor final debe ser menor o igual al valor inicial')
      }

      if (cylinderMinCents % STEP_CENTS !== 0 || cylinderMaxCents % STEP_CENTS !== 0) {
        errors.push('Cilindro: los valores deben avanzar en pasos de 0.25')
      }
    }

    let sphereCount = 0
    let cylinderCount = 0

    if (errors.length === 0) {
      sphereCount = (sphereMaxCents - sphereMinCents) / STEP_CENTS + 1
      cylinderCount = (cylinderMinCents - cylinderMaxCents) / STEP_CENTS + 1
    }

    const payload =
      errors.length > 0
        ? null
        : {
            product_id: Number(form.productId),
            sphere: {
              min: centsToDecimal(sphereMinCents),
              max: centsToDecimal(sphereMaxCents),
            },
            cylinder: {
              min: centsToDecimal(cylinderMinCents),
              max: centsToDecimal(cylinderMaxCents),
            },
          }

    return {
      errors,
      payload,
      sphereCount,
      cylinderCount,
      total: sphereCount * cylinderCount,
    }
  })

  const canSubmit = computed(() => {
    return !isSubmitting.value && validation.value.errors.length === 0 && validation.value.total > 0
  })

  async function loadMicasProducts() {
    isLoading.value = true

    try {
      const response = await getMicasProductsService()
      micasProducts.value = Array.isArray(response) ? response : []
      form.productId = micasProducts.value[0]?.id ?? null
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los productos de lentes',
        life: 5000,
      })
    } finally {
      isLoading.value = false
    }
  }

  async function submitBatch() {
    if (!canSubmit.value) {
      toast.add({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: validation.value.errors[0] ?? 'Verifica los intervalos capturados',
        life: 5000,
      })
      return
    }

    isSubmitting.value = true
    batchResult.value = null

    try {
      const response = await batchCreateLensItemsService(validation.value.payload)
      batchResult.value = response
      resetForm()

      toast.add({
        severity: 'success',
        summary: 'Productos creados',
        detail: `Se crearon ${response.created} productos. ${response.skipped} ya existian.`,
        life: 7000,
      })
    } catch (error) {
      const detail = error?.errors
        ? normalizeApiError(error)
        : (error?.message ?? 'No se pudieron crear los productos')

      toast.add({
        severity: 'error',
        summary: 'No fue posible crear productos',
        detail,
        life: 7000,
      })
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    form,
    isLoading,
    isSubmitting,
    micasProducts,
    validation,
    canSubmit,
    batchResult,
    loadMicasProducts,
    submitBatch,
  }
}
