import { useToast } from 'primevue'

type ToastSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'

const DEFAULT_TOAST_LIFE = 4000

export function useAppToast() {
  const toast = useToast()

  return function notify(
    severity: ToastSeverity,
    summary: string,
    message: string,
    life: number = DEFAULT_TOAST_LIFE,
  ) {
    toast.add({ severity, summary, detail: message, life })
  }
}
