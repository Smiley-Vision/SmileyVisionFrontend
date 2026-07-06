<script setup>
import Spinner from '@/modules/core/components/Spinner.vue'
import AddAddressModal from '@/modules/user/components/AddAddressModal.vue'
import DeleteAddressModal from '@/modules/user/components/DeleteAddressModal.vue'
import EditAddressModal from '@/modules/user/components/EditAddressModal.vue'
import EditProfileModal from '@/modules/user/components/EditProfileModal.vue'
import GeneralUserData from '@/modules/user/components/GeneralUserData.vue'
import ProfileAddressList from '@/modules/user/components/ProfileAddressList.vue'
import ProfileHeader from '@/modules/user/components/ProfileHeader.vue'
import { useProfileView } from '@/modules/user/composables/useProfileView.js'

const {
  cityOptions,
  isLoading,
  isLoggingOut,
  isSavingProfile,
  isSavingAddress,
  isDeletingAddress,
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
} = useProfileView()

function handleAddressActions(payload) {
  toggleAddressActionsMenu(payload.event, payload.address)
}
</script>

<template>
  <Spinner :isLoading text="Cargando perfil..." />

  <div v-if="!isLoading" class="lg:px-12 px-6 lg:py-10 py-6">
    <h1 class="text-5xl font-bold text-sky-800 mb-8">Perfil</h1>

    <Card class="border border-slate-200 rounded-[20px] shadow-[0_8px_30px_rgba(14,88,128,0.1)]">
      <template #content>
        <ProfileHeader
          :full-name="fullName"
          :role-label="roleLabel"
          :is-logging-out="isLoggingOut"
          @edit-profile="openEditProfile"
          @logout="handleLogout"
        />

        <GeneralUserData :phone="formatPhone(user?.phone_number)" :email="user?.email" />

        <ProfileAddressList
          ref="addressActionsMenu"
          :addresses="addresses"
          :has-addresses="hasAddresses"
          :menu-items="addressMenuItems"
          :get-map-thumbnail="getAddressMapThumbnail"
          :format-main-line="formatAddressLine"
          :format-secondary-line="formatAddressLocation"
          @open-actions="handleAddressActions"
          @add-address="openAddAddressModal"
        />
      </template>
    </Card>

    <EditProfileModal
      v-model:visible="showEditProfileModal"
      :form="profileForm"
      :email="user?.email"
      :is-saving="isSavingProfile"
      @submit="submitProfileChanges"
    />

    <AddAddressModal
      v-model:visible="showAddAddressModal"
      :form="createAddressForm"
      :city-options="cityOptions"
      :is-saving="isSavingAddress"
      @submit="submitCreateAddress"
    />

    <EditAddressModal
      v-model:visible="showEditAddressModal"
      :form="editAddressForm"
      :city-options="cityOptions"
      :is-saving="isSavingAddress"
      @submit="submitEditAddress"
    />

    <DeleteAddressModal
      v-model:visible="showDeleteAddressModal"
      :is-deleting="isDeletingAddress"
      @confirm="confirmDeleteAddress"
    />
  </div>

  <Toast position="bottom-right" />
</template>
