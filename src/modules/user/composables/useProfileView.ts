import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAppToast } from '@/modules/core/composables/useAppToast'
import type { AuthUser } from '@/modules/core/interfaces/AuthUser'
import { useAuthStore } from '@/modules/core/stores/auth'
import { USER_ROLE_LABELS, UserRole } from '@/modules/user/enums/UserRole'

import { useAddressBook } from './useAddressBook'
import { useAddressMapThumbnails } from './useAddressMapThumbnails'
import { useCityCatalog } from './useCityCatalog'
import { useProfileForm } from './useProfileForm'

export function useProfileView() {
  const notify = useAppToast()
  const auth = useAuthStore()
  const router = useRouter()

  const isLoading = ref(true)
  const isLoggingOut = ref(false)
  const user = ref<AuthUser | null>(null)

  const cityCatalog = useCityCatalog()
  const mapThumbnails = useAddressMapThumbnails(cityCatalog)
  const addressBook = useAddressBook(cityCatalog, mapThumbnails)
  const profile = useProfileForm(user)

  const fullName = computed(() => {
    if (!user.value) return ''

    const firstName = user.value.first_name ?? ''
    const lastName = user.value.last_name ?? ''

    return `${firstName} ${lastName}`.trim() || 'Usuario'
  })

  const roleLabel = computed(
    () => USER_ROLE_LABELS[Number(user.value?.role_id) as UserRole] ?? 'Cliente',
  )

  async function loadProfileData() {
    user.value = await auth.fetchMe()
    profile.assignProfileForm()

    await addressBook.loadAddresses()
  }

  async function handleLogout() {
    try {
      isLoggingOut.value = true

      await auth.logout()
      await router.push({ name: 'home' })

      notify('success', 'Éxito', 'Sesión cerrada', 3500)
    } catch {
      notify('error', 'Error', 'No se pudo cerrar la sesión.')
    } finally {
      isLoggingOut.value = false
    }
  }

  onMounted(async () => {
    try {
      await loadProfileData()
    } catch {
      notify('error', 'Error', 'No se pudo cargar la información del perfil.', 4500)
    } finally {
      isLoading.value = false
    }
  })

  return {
    cityOptions: cityCatalog.cityOptions,
    isLoading,
    isLoggingOut,
    isSavingProfile: profile.isSavingProfile,
    isSavingAddress: addressBook.isSavingAddress,
    isDeletingAddress: addressBook.isDeletingAddress,
    user,
    addresses: addressBook.addresses,
    showEditProfileModal: profile.showEditProfileModal,
    showAddAddressModal: addressBook.showAddAddressModal,
    showEditAddressModal: addressBook.showEditAddressModal,
    showDeleteAddressModal: addressBook.showDeleteAddressModal,
    profileForm: profile.profileForm,
    createAddressForm: addressBook.createAddressForm,
    editAddressForm: addressBook.editAddressForm,
    fullName,
    roleLabel,
    hasAddresses: addressBook.hasAddresses,
    addressActionsMenu: addressBook.addressActionsMenu,
    addressMenuItems: addressBook.addressMenuItems,
    formatAddressLocation: cityCatalog.formatAddressLocation,
    getAddressMapThumbnail: mapThumbnails.getAddressMapThumbnail,
    openEditProfile: profile.openEditProfile,
    openAddAddressModal: addressBook.openAddAddressModal,
    toggleAddressActionsMenu: addressBook.toggleAddressActionsMenu,
    handleLogout,
    submitProfileChanges: profile.submitProfileChanges,
    submitCreateAddress: addressBook.submitCreateAddress,
    submitEditAddress: addressBook.submitEditAddress,
    confirmDeleteAddress: addressBook.confirmDeleteAddress,
  }
}
