import { onMounted, ref } from 'vue'

import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import type { PaginationMeta } from '@/modules/registration/interfaces/Pagination'
import type { RegistrationApplication } from '@/modules/registration/interfaces/RegistrationApplication'
import {
  discardAcceptedApplicationService,
  getRegistrationApplicationsService,
  rejectRegistrationApplicationService,
  sendRegistrationInvitationService,
} from '@/modules/registration/services/registrationApplicationService'

export function useRegistrationApplications() {
  const notify = useAppToast()

  const applications = ref<RegistrationApplication[]>([])
  const pagination = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 4,
    total: 0,
  })
  const isLoading = ref(true)
  const processingIds = ref(new Set<number>())

  const applicationToReject = ref<RegistrationApplication | null>(null)
  const showRejectDialog = ref(false)
  const isRejecting = ref(false)

  function isProcessing(id: number) {
    return processingIds.value.has(id)
  }

  function startProcessing(id: number) {
    processingIds.value = new Set(processingIds.value).add(id)
  }

  function stopProcessing(id: number) {
    const next = new Set(processingIds.value)
    next.delete(id)
    processingIds.value = next
  }

  async function loadApplications(page = 1) {
    isLoading.value = true

    try {
      const response = await getRegistrationApplicationsService(page)
      applications.value = response.data
      pagination.value = response.meta

      console.log(applications.value);
      
    } catch (error) {
      applications.value = []
      notify('error', 'Error', firstProblemMessage(error as ApiProblemDetails))
    } finally {
      isLoading.value = false
    }
  }

  /** Reloads the current page, stepping back a page if it was left empty. */
  async function refreshAfterRemoval() {
    const isLastItemOnPage = applications.value.length === 1
    const hasPreviousPage = pagination.value.current_page > 1
    const targetPage =
      isLastItemOnPage && hasPreviousPage
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await loadApplications(targetPage)
  }

  function setPage(page: number) {
    void loadApplications(page)
  }

  async function acceptApplication(application: RegistrationApplication) {
    if (isProcessing(application.id)) return
    startProcessing(application.id)

    try {
      await sendRegistrationInvitationService(application.email)
      await discardAcceptedApplicationService(application.id)

      notify('success', 'Éxito', 'Correo de invitación enviado')
      await refreshAfterRemoval()
    } catch (error) {
      notify('error', 'Error', firstProblemMessage(error as ApiProblemDetails))
    } finally {
      stopProcessing(application.id)
    }
  }

  function openRejectDialog(application: RegistrationApplication) {
    applicationToReject.value = application
    showRejectDialog.value = true
  }

  function closeRejectDialog() {
    showRejectDialog.value = false
    applicationToReject.value = null
  }

  async function confirmReject() {
    const application = applicationToReject.value
    if (!application) return

    isRejecting.value = true

    try {
      await rejectRegistrationApplicationService(application.id)
      notify('success', 'Éxito', 'Solicitud rechazada y solicitante notificado')
      closeRejectDialog()
      await refreshAfterRemoval()
    } catch (error) {
      notify('error', 'Error', firstProblemMessage(error as ApiProblemDetails))
    } finally {
      isRejecting.value = false
    }
  }

  onMounted(() => {
    void loadApplications()
  })

  return {
    applications,
    pagination,
    isLoading,
    isProcessing,
    setPage,
    acceptApplication,
    showRejectDialog,
    applicationToReject,
    isRejecting,
    openRejectDialog,
    closeRejectDialog,
    confirmReject,
  }
}
