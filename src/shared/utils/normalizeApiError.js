export function normalizeApiError(error) {
    const firstValidationError = getFirstValidationError(error?.errors)

    if (firstValidationError) {
        return firstValidationError
    }

    const message = getMessage(error)

    if (message) {
        return message
    }

    return 'Error inesperado'
}

function getFirstValidationError(errors) {
    if (!errors || typeof errors !== 'object') {
        return ''
    }

    const firstField = Object.keys(errors)[0]
    const firstError = errors[firstField]

    if (Array.isArray(firstError)) {
        return String(firstError[0] ?? '')
    }

    return String(firstError || '')
}

function getMessage(error) {
    if (typeof error === 'string') {
        return error
    }

    const message = error?.message ?? error?.error

    if (!message) {
        return ''
    }

    const normalizedMessage = String(message)

    return normalizedMessage.includes('[object Object]') ? '' : normalizedMessage
}
