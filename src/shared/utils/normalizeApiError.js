export function normalizeApiError(error) {
    if (!error || !error.errors) {
        return 'Error inesperado'
    }

    const firstField = Object.keys(error.errors)[0]

    if (!firstField || !error.errors[firstField] || !error.errors[firstField][0]) {
        return 'Error inesperado'
    }

    return error.errors[firstField][0]
}
