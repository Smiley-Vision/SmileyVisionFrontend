import smileyApi from '@/modules/core/api/smileyApi'
import type { Paginated } from '@/modules/registration/interfaces/Pagination'
import type { RegistrationApplication } from '@/modules/registration/interfaces/RegistrationApplication'

export async function getRegistrationApplicationsService(page = 1) {
  return (
    await smileyApi.get<Paginated<RegistrationApplication>>('registration-applications', {
      params: { page },
    })
  ).data
}

export async function sendRegistrationInvitationService(email: string) {
  return (await smileyApi.post<{ message: string }>('send-register-mail', { email })).data
}

export async function rejectRegistrationApplicationService(id: number) {
  return (
    await smileyApi.delete<{ message: string; data: RegistrationApplication }>(
      `registration-applications/${id}`,
    )
  ).data
}

/**
 * Discards an application once its invitation email was already sent.
 * Passes `notify=false` so the applicant doesn't also receive a
 * contradictory rejection email right after being accepted.
 */
export async function discardAcceptedApplicationService(id: number) {
  return (
    await smileyApi.delete<{ message: string; data: RegistrationApplication }>(
      `registration-applications/${id}`,
      { params: { notify: false } },
    )
  ).data
}
