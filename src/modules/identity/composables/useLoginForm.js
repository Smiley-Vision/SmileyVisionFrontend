import { reactive } from 'vue'

export function useLoginForm() {
  const form = reactive({
    email: '',
    password: '',
  })

  return { form }
}
