import axios from 'axios'

export interface ApiProblemDetails {
  type: string
  status: number
  title: string
  detail: string
  instance: string
  errors?: Record<string, string[]>
}

function isApiProblemDetails(value: unknown): value is ApiProblemDetails {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'title' in value &&
    'detail' in value
  )
}

export function toApiProblem(error: unknown): ApiProblemDetails {
  if (axios.isAxiosError(error) && isApiProblemDetails(error.response?.data)) {
    return error.response.data
  }

  return {
    type: 'about:blank',
    status: axios.isAxiosError(error) ? (error.response?.status ?? 0) : 0,
    title: 'Error inesperado',
    detail: axios.isAxiosError(error) ? error.message : 'Ocurrió un error inesperado.',
    instance: '',
  }
}

export function firstProblemMessage(problem: ApiProblemDetails): string {
  const firstField = problem.errors ? Object.keys(problem.errors)[0] : undefined
  const firstFieldError = firstField ? problem.errors?.[firstField]?.[0] : undefined

  return firstFieldError ?? problem.detail ?? problem.title
}
