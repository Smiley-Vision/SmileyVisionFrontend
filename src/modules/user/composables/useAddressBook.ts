import { useToast } from 'primevue'
import type { MenuItem } from 'primevue/menuitem'
import { computed, reactive, ref } from 'vue'

import type { ApiProblemDetails } from '@/modules/core/api/apiProblem'
import { firstProblemMessage } from '@/modules/core/api/apiProblem'
import type { Address, AddressFormData } from '@/modules/user/interfaces/Address'
import {
  createAddressService,
  deleteAddressService,
  getUserAddressesService,
  updateAddressService,
  updateDefaultAddressService,
} from '@/modules/user/services/profileService'
import {
  addressToFormData,
  buildAddressPayload,
  createEmptyAddressForm,
  extractAddressList,
  normalizeAddress,
  sortAddresses,
} from '@/modules/user/utils/address'

import type { useAddressMapThumbnails } from './useAddressMapThumbnails'
import type { useCityCatalog } from './useCityCatalog'

interface AddressActionsMenu {
  toggle: (event: Event) => void
}

export function useAddressBook(
  cityCatalog: ReturnType<typeof useCityCatalog>,
  mapThumbnails: ReturnType<typeof useAddressMapThumbnails>,
) {
  const toast = useToast()

  const addresses = ref<Address[]>([])
  const isSavingAddress = ref(false)
  const isDeletingAddress = ref(false)

  const showAddAddressModal = ref(false)
  const showEditAddressModal = ref(false)
  const showDeleteAddressModal = ref(false)

  const addressToDelete = ref<Address | null>(null)
  const selectedAddress = ref<Address | null>(null)
  const addressActionsMenu = ref<AddressActionsMenu | null>(null)

  const createAddressForm = reactive<AddressFormData>(createEmptyAddressForm())
  const editAddressForm = reactive<AddressFormData>(createEmptyAddressForm())

  const hasAddresses = computed(() => addresses.value.length > 0)

  const addressMenuItems = computed<MenuItem[]>(() => [
    {
      label: 'Editar',
      icon: 'pi pi-pen-to-square',
      command: () => {
        if (selectedAddress.value) {
          openEditAddressModal(selectedAddress.value)
        }
      },
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      command: () => {
        if (selectedAddress.value) {
          openDeleteAddressModal(selectedAddress.value)
        }
      },
    },
  ])

  function toggleAddressActionsMenu(event: Event, address: Address) {
    selectedAddress.value = address
    addressActionsMenu.value?.toggle(event)
  }

  async function loadAddresses() {
    const response = await getUserAddressesService()
    const addressList = extractAddressList(response)

    addressList.forEach((address) => cityCatalog.mergeCityOption(address.city_id))

    let normalized = sortAddresses(addressList.map((address) => normalizeAddress(address)))

    if (normalized.length > 0 && !normalized.some((address) => address.is_default)) {
      await updateDefaultAddressService(normalized[0].id)

      const retryResponse = await getUserAddressesService()
      const retryList = extractAddressList(retryResponse)

      retryList.forEach((address) => cityCatalog.mergeCityOption(address.city_id))
      normalized = sortAddresses(retryList.map((address) => normalizeAddress(address)))
    }

    addresses.value = normalized
    void mapThumbnails.loadAddressMapThumbnails(normalized)
  }

  function openAddAddressModal() {
    Object.assign(createAddressForm, createEmptyAddressForm())
    createAddressForm.is_default = !hasAddresses.value
    showAddAddressModal.value = true
  }

  function openEditAddressModal(address: Address) {
    Object.assign(editAddressForm, addressToFormData(address))
    showEditAddressModal.value = true
  }

  function openDeleteAddressModal(address: Address) {
    addressToDelete.value = address
    showDeleteAddressModal.value = true
  }

  async function submitCreateAddress() {
    try {
      isSavingAddress.value = true

      const hadAddressesBefore = addresses.value.length > 0
      const wantsDefault = createAddressForm.is_default
      const payload = buildAddressPayload(createAddressForm)

      const response = await createAddressService(payload)
      const createdAddress = response?.data

      if (hadAddressesBefore && wantsDefault && createdAddress?.id) {
        await updateDefaultAddressService(createdAddress.id)
      }

      await loadAddresses()
      showAddAddressModal.value = false

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Dirección registrada correctamente.',
        life: 3500,
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: firstProblemMessage(error as ApiProblemDetails),
        life: 4500,
      })
    } finally {
      isSavingAddress.value = false
    }
  }

  async function submitEditAddress() {
    const previousAddress = addresses.value.find((address) => address.id === editAddressForm.id)

    if (!previousAddress) {
      showEditAddressModal.value = false
      return
    }

    try {
      isSavingAddress.value = true

      const payload = buildAddressPayload(editAddressForm)
      await updateAddressService(editAddressForm.id as number, payload)

      if (!previousAddress.is_default && editAddressForm.is_default) {
        await updateDefaultAddressService(editAddressForm.id as number)
      }

      await loadAddresses()
      showEditAddressModal.value = false

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Dirección actualizada correctamente.',
        life: 3500,
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: firstProblemMessage(error as ApiProblemDetails),
        life: 4500,
      })
    } finally {
      isSavingAddress.value = false
    }
  }

  async function confirmDeleteAddress() {
    if (!addressToDelete.value) return

    try {
      isDeletingAddress.value = true

      await deleteAddressService(addressToDelete.value.id)
      await loadAddresses()

      showDeleteAddressModal.value = false
      addressToDelete.value = null

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Dirección eliminada correctamente.',
        life: 3500,
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: firstProblemMessage(error as ApiProblemDetails),
        life: 4000,
      })
    } finally {
      isDeletingAddress.value = false
    }
  }

  return {
    addresses,
    hasAddresses,
    isSavingAddress,
    isDeletingAddress,
    showAddAddressModal,
    showEditAddressModal,
    showDeleteAddressModal,
    createAddressForm,
    editAddressForm,
    addressActionsMenu,
    addressMenuItems,
    toggleAddressActionsMenu,
    loadAddresses,
    openAddAddressModal,
    submitCreateAddress,
    submitEditAddress,
    confirmDeleteAddress,
  }
}
