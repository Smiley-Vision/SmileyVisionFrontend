import { ref } from 'vue'

import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'
import { downloadOrderReportService } from '@/modules/orders/services/orderService'

export function useOrderReports() {
  const notify = useAppToast()
  const isDownloading = ref(false)

  async function downloadMonthly(month: number, year: number) {
    isDownloading.value = true

    try {
      await downloadOrderReportService('monthly', { month, year })
    } catch (error) {
      notify('error', 'Error', firstProblemMessage(error as ApiProblemDetails))
    } finally {
      isDownloading.value = false
    }
  }

  async function downloadWeekly(startDate: string, endDate: string) {
    isDownloading.value = true

    try {
      await downloadOrderReportService('weekly', { start_date: startDate, end_date: endDate })
    } catch (error) {
      notify('error', 'Error', firstProblemMessage(error as ApiProblemDetails))
    } finally {
      isDownloading.value = false
    }
  }

  return {
    isDownloading,
    downloadMonthly,
    downloadWeekly,
  }
}
