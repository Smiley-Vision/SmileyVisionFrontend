import { useToast } from 'primevue'
import { reactive, ref } from 'vue'
import type { Ref } from 'vue'

import type { AuthUser } from '@/modules/core/interfaces/AuthUser'
import { useAuthStore } from '@/modules/core/stores/auth'
import type { ProfileFormData } from '@/modules/user/interfaces/ProfileForm'
import { normalizePhoneDigits } from '@/modules/user/utils/phone'

export function useProfileForm(user: Ref<AuthUser | null>) {
  const toast = useToast()
  const auth = useAuthStore()

  const isSavingProfile = ref(false)
  const showEditProfileModal = ref(false)

  const profileForm = reactive<ProfileFormData>({
    first_name: '',
    last_name: '',
    phone_number: '',
  })

  function assignProfileForm() {
    profileForm.first_name = user.value?.first_name ?? ''
    profileForm.last_name = user.value?.last_name ?? ''
    profileForm.phone_number = normalizePhoneDigits(user.value?.phone_number)
  }

  function openEditProfile() {
    assignProfileForm()
    showEditProfileModal.value = true
  }

  async function submitProfileChanges() {
    try {
      isSavingProfile.value = true

      const updatedUser: AuthUser = {
        ...(user.value as AuthUser),
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        phone_number: normalizePhoneDigits(profileForm.phone_number),
      }

      user.value = updatedUser
      auth.setSession(auth.token as string, updatedUser)
      showEditProfileModal.value = false

      toast.add({
        severity: 'warn',
        summary: 'Atención',
        detail:
          'La API actual no expone endpoint para actualizar usuario. Cambio aplicado localmente.',
        life: 5000,
      })
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar la información del usuario.',
        life: 4000,
      })
    } finally {
      isSavingProfile.value = false
    }
  }

  return {
    isSavingProfile,
    showEditProfileModal,
    profileForm,
    assignProfileForm,
    openEditProfile,
    submitProfileChanges,
  }
}
