<script setup>
import Spinner from '@/modules/core/components/Spinner.vue'
import AddressFormFields from '@/modules/identity/components/AddressFormFields.vue'
import ProfileAddressCard from '@/modules/identity/components/ProfileAddressCard.vue'
import { useProfileView } from '@/modules/identity/composables/useProfileView'

const {
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
} = useProfileView()

function handleAddressActions(payload) {
  toggleAddressActionsMenu(payload.event, payload.address)
}
</script>

<template>
  <Spinner :isLoading text="Cargando perfil..." />

  <div v-if="!isLoading" class="xl:px-20 md:px-12 px-8 lg:mt-14 md:py-10 py-8">
    <h1 class="text-5xl font-bold text-sky-800 mb-8">Perfil</h1>

    <Card class="border border-slate-200 rounded-[20px] shadow-[0_8px_30px_rgba(14,88,128,0.1)]">
      <template #content>
        <div
          class="flex md:flex-row flex-col md:items-center items-start justify-between md:gap-6 gap-4 pb-6"
        >
          <div class="flex md:flex-row flex-col md:items-center items-start gap-5">
            <div
              class="w-[124px] h-[124px] rounded-full flex items-center justify-center bg-[#d0dbe5]"
            >
              <i class="pi pi-user text-slate-500" style="scale: 3"></i>
            </div>
            <div>
              <div class="text-sky-800 md:text-5xl text-3xl font-bold leading-tight">
                {{ fullName }}
              </div>
              <Tag :value="roleLabel" severity="secondary" class="mt-3" />
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <Button
              label="Editar información"
              icon="pi pi-pen-to-square"
              class="!bg-[#075985] !border-[#075985] hover:!bg-[#1373aa] hover:!border-[#1373aa]"
              @click="openEditProfile"
            />
            <Button
              label="Cerrar sesión"
              icon="pi pi-sign-out"
              severity="danger"
              :loading="isLoggingOut"
              @click="handleLogout"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 border-y border-slate-200">
          <div class="px-5 py-7">
            <div class="text-[#075985] text-[1.35rem] md:text-[1.75rem] font-bold mb-[0.8rem]">
              Teléfono celular
            </div>
            <div class="flex items-center gap-[0.6rem] text-slate-600 text-[1.2rem] font-medium">
              <i class="pi pi-phone text-[#075985]"></i>
              <span>{{ formatPhone(user?.phone_number) }}</span>
            </div>
          </div>
          <div class="px-5 py-7 border-t border-slate-200 md:border-t-0 md:border-l">
            <div class="text-[#075985] text-[1.35rem] md:text-[1.75rem] font-bold mb-[0.8rem]">
              Correo electrónico
            </div>
            <div class="flex items-center gap-[0.6rem] text-slate-600 text-[1.2rem] font-medium">
              <i class="pi pi-envelope text-[#075985]"></i>
              <span>{{ user?.email }}</span>
            </div>
          </div>
        </div>

        <div class="pt-8">
          <div class="text-sky-800 text-4xl font-bold mb-5">Direcciones</div>

          <div
            v-if="!hasAddresses"
            class="border border-dashed border-slate-400 rounded-xl p-4 text-slate-600 font-medium"
          >
            No tienes direcciones registradas. Agrega la primera dirección para comenzar.
          </div>

          <div v-else class="grid lg:grid-cols-2 grid-cols-1 gap-6">
            <ProfileAddressCard
              v-for="address in addresses"
              :key="address.id"
              :address="address"
              :map-src="getAddressMapThumbnail(address)"
              :main-line="formatAddressLine(address)"
              :secondary-line="formatAddressLocation(address)"
              @open-actions="handleAddressActions"
            />
          </div>

          <Menu ref="addressActionsMenu" :model="addressMenuItems" popup />

          <Button
            label="Agregar otra dirección"
            icon="pi pi-plus"
            class="mt-6 !text-[#075985] hover:!text-[#0c4a6e] font-bold text-xl"
            text
            @click="openAddAddressModal"
          />
        </div>
      </template>
    </Card>

    <Dialog v-model:visible="showEditProfileModal" modal :style="{ width: '36rem' }">
      <template #header>
        <div class="text-[#075985] font-semibold">Editar información</div>
      </template>
      <form class="flex flex-col gap-4" @submit.prevent="submitProfileChanges">
        <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
          <div class="flex flex-col gap-1">
            <label for="first_name">Nombre</label>
            <InputText id="first_name" v-model="profileForm.first_name" required />
          </div>
          <div class="flex flex-col gap-1">
            <label for="last_name">Apellido</label>
            <InputText id="last_name" v-model="profileForm.last_name" required />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label for="phone_number">Teléfono</label>
          <InputMask
            id="phone_number"
            v-model="profileForm.phone_number"
            mask="9999999999"
            :unmask="true"
            required
          />
        </div>

        <div class="flex flex-col gap-1">
          <label>Correo electrónico</label>
          <InputText :model-value="user?.email" disabled />
        </div>

        <div class="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            text
            @click="showEditProfileModal = false"
          />
          <Button type="submit" label="Guardar" :loading="isSavingProfile" />
        </div>
      </form>
    </Dialog>

    <Dialog v-model:visible="showAddAddressModal" modal :style="{ width: '42rem' }">
      <template #header>
        <div class="text-[#075985] font-semibold">Agregar dirección</div>
      </template>
      <form class="flex flex-col gap-4" @submit.prevent="submitCreateAddress">
        <AddressFormFields :form="createAddressForm" :city-options="cityOptions" id-prefix="new" />

        <div class="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            text
            @click="showAddAddressModal = false"
          />
          <Button type="submit" label="Guardar" :loading="isSavingAddress" />
        </div>
      </form>
    </Dialog>

    <Dialog v-model:visible="showEditAddressModal" modal :style="{ width: '42rem' }">
      <template #header>
        <div class="text-[#075985] font-semibold">Editar dirección</div>
      </template>
      <form class="flex flex-col gap-4" @submit.prevent="submitEditAddress">
        <AddressFormFields :form="editAddressForm" :city-options="cityOptions" id-prefix="edit" />

        <div class="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            text
            @click="showEditAddressModal = false"
          />
          <Button type="submit" label="Guardar" />
        </div>
      </form>
    </Dialog>

    <Dialog v-model:visible="showDeleteAddressModal" modal :style="{ width: '30rem' }">
      <template #header>
        <div class="text-[#075985] font-semibold">Eliminar dirección</div>
      </template>
      <div class="text-slate-700 leading-relaxed">
        ¿Seguro que deseas eliminar esta dirección? Esta acción se mostrará de inmediato en la
        vista.
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Cancelar"
            severity="secondary"
            text
            @click="showDeleteAddressModal = false"
          />
          <Button label="Eliminar" severity="danger" @click="confirmDeleteAddress" />
        </div>
      </template>
    </Dialog>
  </div>

  <Toast position="bottom-right" />
</template>
