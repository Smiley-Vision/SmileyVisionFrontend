import type { AuthUser } from '@/modules/core/interfaces/AuthUser'

export interface SignUpResponse {
  message: string
  data: {
    user: AuthUser
    token: string
  }
}
