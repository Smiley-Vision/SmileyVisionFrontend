import { useAuthStore } from '@/modules/core/stores/auth.ts'
import {
  createAddressService,
  getAuthenticatedUserService,
  getUserAddressesService,
  updateDefaultAddressService,
} from '@/modules/identity/services/profileService'
import { useToast } from 'primevue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const roleLabels = {
  1: 'Admin',
  2: 'Cliente',
  3: 'Driver',
}

const cityStateById = {
  1: 'Campeche',
  2: 'Ciudad de Mexico',
  3: 'Tabasco',
  4: 'Yucatan',
}

const defaultCityOptions = [
  { label: 'Ciudad de Mexico', value: 2 },
  { label: 'Merida', value: 4 },
  { label: 'San Francisco de Campeche', value: 1 },
  { label: 'Villahermosa', value: 3 },
]

function createEmptyAddressForm() {
  return {
    id: null,
    city_id: null,
    street: '',
    between_a: '',
    between_b: '',
    external_number: '',
    internal_number: '',
    district: '',
    postal_code: '',
    notes: '',
    is_default: false,
  }
}

function toBoolean(value) {
  return value === true || value === 1 || value === '1'
}

function normalizeAddress(address) {
  return {
    ...address,
    is_default: toBoolean(address?.is_default),
  }
}

function sortAddresses(list) {
  return [...list].sort((a, b) => {
    const defaultPriority = Number(b.is_default) - Number(a.is_default)

    if (defaultPriority !== 0) return defaultPriority

    return Number(b.id) - Number(a.id)
  })
}

export function useProfileView() {
  const toast = useToast()
  const auth = useAuthStore()
  const router = useRouter()

  const googleMapsEmbedApiKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY
  const mapFallbackThumbnail =
    'https://maps.google.com/maps?q=19.833141,-90.521352&z=17&hl=es&output=embed'

  const cityOptions = ref([...defaultCityOptions])
  const isLoading = ref(true)
  const isLoggingOut = ref(false)
  const isSavingProfile = ref(false)
  const isSavingAddress = ref(false)
  const user = ref(null)
  const addresses = ref([])

  const showEditProfileModal = ref(false)
  const showAddAddressModal = ref(false)
  const showEditAddressModal = ref(false)
  const showDeleteAddressModal = ref(false)

  const addressToDelete = ref(null)
  const selectedAddress = ref(null)
  const addressActionsMenu = ref(null)

  const addressMapThumbnailById = reactive({})
  const geocodingCacheByQuery = reactive({})

  const profileForm = reactive({
    first_name: '',
    last_name: '',
    phone_number: '',
  })

  const createAddressForm = reactive(createEmptyAddressForm())
  const editAddressForm = reactive(createEmptyAddressForm())

  const fullName = computed(() => {
    if (!user.value) return ''

    const firstName = user.value.first_name ?? ''
    const lastName = user.value.last_name ?? ''

    return `${firstName} ${lastName}`.trim() || user.value.name || 'Usuario'
  })

  const roleLabel = computed(() => roleLabels[user.value?.role_id] ?? 'Cliente')
  const hasAddresses = computed(() => addresses.value.length > 0)
  const addressMenuItems = computed(() => [
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

  function syncAuthUser(updatedUser) {
    auth.user = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  function mergeCityOption(cityId) {
    const normalizedId = Number(cityId)

    if (!normalizedId) return

    if (!cityOptions.value.some((city) => city.value === normalizedId)) {
      cityOptions.value.push({
        label: `Ciudad #${normalizedId}`,
        value: normalizedId,
      })
    }
  }

  function formatPhone(phoneNumber) {
    const digits = String(phoneNumber ?? '').replace(/\D/g, '')

    if (digits.length !== 10) {
      return phoneNumber || 'No registrado'
    }

    return `(+52) ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }

  function resolveCityName(cityId) {
    const option = cityOptions.value.find((city) => city.value === Number(cityId))
    return option?.label ?? `Ciudad #${cityId}`
  }

  function formatAddressLine(address) {
    return `Calle ${address.street}, Colonia ${address.district}`
  }

  function formatAddressLocation(address) {
    const city = resolveCityName(address.city_id)
    return `${city}, Mexico`
  }

  function resolveStateName(cityId) {
    const normalizedId = Number(cityId)
    return cityStateById[normalizedId] ?? resolveCityName(cityId)
  }

  function buildAddressSearchQuery(address) {
    const city = resolveCityName(address.city_id)
    const state = resolveStateName(address.city_id)
    const street = String(address.street ?? '').trim()
    const number = String(address.external_number ?? '').trim()
    const district = String(address.district ?? '').trim()
    const postalCode = String(address.postal_code ?? '').trim()
    const streetWithNumber = street ? `Calle ${street}${number ? ` #${number}` : ''}` : ''
    const districtLabel = district ? `Colonia ${district}` : ''

    return [city, state, streetWithNumber, districtLabel, postalCode, 'Mexico']
      .filter(Boolean)
      .join(', ')
  }

  function buildMapThumbnailUrl(query, location) {
    const resolvedQuery = String(query ?? '').trim()
    const coordinates =
      Number.isFinite(location?.lat) && Number.isFinite(location?.lon)
        ? `${location.lat},${location.lon}`
        : ''

    if (googleMapsEmbedApiKey) {
      const params = new URLSearchParams({
        key: googleMapsEmbedApiKey,
        q: resolvedQuery || coordinates || 'San Francisco de Campeche, Campeche, Mexico',
        zoom: '18',
        language: 'es',
        region: 'MX',
      })

      return `https://www.google.com/maps/embed/v1/place?${params.toString()}`
    }

    const params = new URLSearchParams({
      q: coordinates || resolvedQuery || 'San Francisco de Campeche, Campeche, Mexico',
      z: '18',
      hl: 'es',
      output: 'embed',
    })

    return `https://maps.google.com/maps?${params.toString()}`
  }

  async function geocodeAddress(query) {
    const cacheKey = String(query).trim().toLowerCase()

    if (geocodingCacheByQuery[cacheKey]) {
      return geocodingCacheByQuery[cacheKey]
    }

    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      countrycodes: 'mx',
      limit: '1',
      extratags: '1',
      'accept-language': 'es-MX,es,en-US,en',
    })

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) return null

    const results = await response.json()
    const firstResult = Array.isArray(results) ? results[0] : null
    const latitude = Number(firstResult?.lat)
    const longitude = Number(firstResult?.lon)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null
    }

    const coordinates = { lat: latitude, lon: longitude }
    geocodingCacheByQuery[cacheKey] = coordinates

    return coordinates
  }

  function getAddressMapThumbnail(address) {
    return addressMapThumbnailById[address.id] ?? mapFallbackThumbnail
  }

  function toggleAddressActionsMenu(event, address) {
    selectedAddress.value = address
    addressActionsMenu.value?.toggle(event)
  }

  async function loadAddressMapThumbnails(addressList) {
    for (const address of addressList) {
      if (!address?.id || addressMapThumbnailById[address.id]) continue

      const searchQuery = buildAddressSearchQuery(address)

      try {
        const coordinates = await geocodeAddress(searchQuery)
        addressMapThumbnailById[address.id] = buildMapThumbnailUrl(searchQuery, coordinates)
      } catch (error) {
        addressMapThumbnailById[address.id] = mapFallbackThumbnail
      }
    }

    const availableIds = new Set(addressList.map((address) => address.id))

    Object.keys(addressMapThumbnailById).forEach((addressId) => {
      if (!availableIds.has(Number(addressId))) {
        delete addressMapThumbnailById[addressId]
      }
    })
  }

  function assignProfileForm() {
    profileForm.first_name = user.value?.first_name ?? ''
    profileForm.last_name = user.value?.last_name ?? ''
    profileForm.phone_number = String(user.value?.phone_number ?? '').replace(/\D/g, '')
  }

  function buildAddressPayload(formData, forceDefaultFalse = false) {
    return {
      user_id: user.value.id,
      city_id: Number(formData.city_id),
      street: String(formData.street).trim(),
      between_a: String(formData.between_a).trim(),
      between_b: String(formData.between_b).trim(),
      external_number: Number(formData.external_number),
      internal_number: formData.internal_number === '' ? null : Number(formData.internal_number),
      district: String(formData.district).trim(),
      postal_code: String(formData.postal_code).trim(),
      notes: String(formData.notes).trim(),
      is_default: forceDefaultFalse ? false : !!formData.is_default,
    }
  }

  async function loadAddresses() {
    const response = await getUserAddressesService(user.value.id)
    const addressList = Array.isArray(response?.addresses) ? response.addresses : []

    addressList.forEach((address) => mergeCityOption(address.city_id))

    let normalized = sortAddresses(addressList.map((address) => normalizeAddress(address)))

    if (normalized.length > 0 && !normalized.some((address) => address.is_default)) {
      await updateDefaultAddressService(user.value.id, normalized[0].id)

      const retryResponse = await getUserAddressesService(user.value.id)
      const retryList = Array.isArray(retryResponse?.addresses) ? retryResponse.addresses : []

      retryList.forEach((address) => mergeCityOption(address.city_id))
      normalized = sortAddresses(retryList.map((address) => normalizeAddress(address)))
    }

    addresses.value = normalized
    void loadAddressMapThumbnails(normalized)
  }

  async function loadProfileData() {
    const authenticatedUser = await getAuthenticatedUserService()

    user.value = authenticatedUser
    syncAuthUser(authenticatedUser)
    assignProfileForm()

    await loadAddresses()
  }

  function openEditProfile() {
    assignProfileForm()
    showEditProfileModal.value = true
  }

  function openAddAddressModal() {
    Object.assign(createAddressForm, createEmptyAddressForm())
    createAddressForm.is_default = !hasAddresses.value
    showAddAddressModal.value = true
  }

  function openEditAddressModal(address) {
    Object.assign(editAddressForm, {
      ...createEmptyAddressForm(),
      ...address,
      is_default: !!address.is_default,
    })

    showEditAddressModal.value = true
  }

  function openDeleteAddressModal(address) {
    addressToDelete.value = address
    showDeleteAddressModal.value = true
  }

  async function submitProfileChanges() {
    try {
      isSavingProfile.value = true

      const updatedUser = {
        ...user.value,
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        phone_number: String(profileForm.phone_number).replace(/\D/g, ''),
      }

      user.value = updatedUser
      syncAuthUser(updatedUser)
      showEditProfileModal.value = false

      toast.add({
        severity: 'warn',
        summary: 'Atención',
        detail:
          'La API actual no expone endpoint para actualizar usuario. Cambio aplicado localmente.',
        life: 5000,
      })
    } catch (error) {
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

  async function submitCreateAddress() {
    try {
      isSavingAddress.value = true

      const hadAddressesBefore = addresses.value.length > 0
      const payload = buildAddressPayload(createAddressForm, hadAddressesBefore)

      await createAddressService(payload)
      await loadAddresses()

      if (hadAddressesBefore && createAddressForm.is_default) {
        const latestAddress = [...addresses.value]
          .sort((a, b) => Number(b.id) - Number(a.id))
          .find(
            (address) =>
              address.street === payload.street &&
              String(address.external_number) === String(payload.external_number) &&
              Number(address.city_id) === Number(payload.city_id),
          )

        if (latestAddress) {
          await updateDefaultAddressService(user.value.id, latestAddress.id)
          await loadAddresses()
        }
      }

      showAddAddressModal.value = false

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Dirección registrada correctamente.',
        life: 3500,
      })
    } catch (error) {
      const message = error?.errors
        ? error.errors[Object.keys(error.errors)[0]][0]
        : 'No se pudo agregar la dirección.'

      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
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

    addresses.value = sortAddresses(
      addresses.value.map((address) => {
        if (address.id !== editAddressForm.id) return address

        return {
          ...address,
          ...editAddressForm,
          city_id: Number(editAddressForm.city_id),
          external_number: Number(editAddressForm.external_number),
          internal_number:
            editAddressForm.internal_number === '' ? null : Number(editAddressForm.internal_number),
          is_default: !!editAddressForm.is_default,
        }
      }),
    )
    if (!previousAddress.is_default && editAddressForm.is_default) {
      try {
        await updateDefaultAddressService(user.value.id, editAddressForm.id)
        await loadAddresses()

        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Dirección principal actualizada.',
          life: 3000,
        })
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar la dirección principal.',
          life: 4000,
        })
      }
    }

    showEditAddressModal.value = false

    toast.add({
      severity: 'warn',
      summary: 'Atención',
      detail:
        'La API actual no expone endpoint para editar direcciones. Cambio visual solo en esta sesión.',
      life: 5500,
    })
  }

  async function confirmDeleteAddress() {
    if (!addressToDelete.value) return

    const deletingId = addressToDelete.value.id
    const wasDefault = !!addressToDelete.value.is_default

    addresses.value = addresses.value.filter((address) => address.id !== deletingId)

    if (wasDefault && addresses.value.length > 0) {
      try {
        await updateDefaultAddressService(user.value.id, addresses.value[0].id)
        await loadAddresses()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo reasignar la dirección principal.',
          life: 4000,
        })
      }
    }

    showDeleteAddressModal.value = false
    addressToDelete.value = null

    toast.add({
      severity: 'warn',
      summary: 'Atención',
      detail:
        'La API actual no expone endpoint para eliminar direcciones. Cambio visual solo en esta sesión.',
      life: 5500,
    })
  }

  async function handleLogout() {
    try {
      isLoggingOut.value = true

      await auth.logout()
      await router.push({ name: 'home' })

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Sesión cerrada',
        life: 3500,
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cerrar la sesión.',
        life: 4000,
      })
    } finally {
      isLoggingOut.value = false
    }
  }

  onMounted(async () => {
    try {
      await loadProfileData()
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la información del perfil.',
        life: 4500,
      })
    } finally {
      isLoading.value = false
    }
  })

  return {
    cityOptions,
    isLoading,
    isLoggingOut,
    isSavingProfile,
    isSavingAddress,
    user,
    addresses,
    showEditProfileModal,
    showAddAddressModal,
    showEditAddressModal,
    showDeleteAddressModal,
    profileForm,
    createAddressForm,
    editAddressForm,
    fullName,
    roleLabel,
    hasAddresses,
    addressActionsMenu,
    addressMenuItems,
    formatPhone,
    formatAddressLine,
    formatAddressLocation,
    getAddressMapThumbnail,
    openEditProfile,
    openAddAddressModal,
    toggleAddressActionsMenu,
    handleLogout,
    submitProfileChanges,
    submitCreateAddress,
    submitEditAddress,
    confirmDeleteAddress,
  }
}
