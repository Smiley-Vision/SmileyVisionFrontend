<script setup lang="ts">
import Paginator, { type PageState } from 'primevue/paginator'
import { computed } from 'vue'

import Spinner from '@/modules/core/components/Spinner.vue'
import RegistrationApplicationCard from '@/modules/registration/components/RegistrationApplicationCard.vue'
import RejectApplicationDialog from '@/modules/registration/components/RejectApplicationDialog.vue'
import { useRegistrationApplications } from '@/modules/registration/composables/useRegistrationApplications'

const {
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
} = useRegistrationApplications()

const first = computed(() => (pagination.value.current_page - 1) * pagination.value.per_page)

function onPageChange(event: PageState) {
  setPage(event.page + 1)
}
</script>

<template>
  <Spinner :is-loading text="Cargando solicitudes..." />

  <div v-if="!isLoading" class="flex flex-col lg:px-32 px-6 lg:py-10 py-6 lg:gap-y-10 gap-y-6">
    <h1
      v-if="applications.length > 0"
      class="lg:text-4xl sm:text-3xl text-3xl font-bold text-sky-800"
    >
      Solicitudes de registro
    </h1>

    <div v-if="applications.length > 0" class="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <div class="grid gap-4">
        <RegistrationApplicationCard
          v-for="application in applications"
          :key="application.id"
          :application="application"
          :is-accepting="isProcessing(application.id)"
          @accept="acceptApplication"
          @reject="openRejectDialog"
        />
      </div>

      <Paginator
        v-if="pagination.last_page > 1"
        :rows="pagination.per_page"
        :total-records="pagination.total"
        :first="first"
        @page="onPageChange"
      />
    </div>

    <div
      v-else
      class="flex flex-col items-center gap-y-3 max-w-2xl mx-auto w-full py-24 text-center"
    >
      <div class="flex size-20 items-center justify-center rounded-full bg-sky-50 text-sky-500">
        <i class="pi pi-inbox" style="font-size: 2.5rem"></i>
      </div>
      <div class="text-2xl font-semibold text-sky-800">No hay solicitudes pendientes</div>
      <div class="text-slate-500">
        Cuando alguien pida acceso a Smiley Vision, su solicitud aparecerá aquí para que puedas
        revisarla.
      </div>
    </div>
  </div>

  <RejectApplicationDialog
    :visible="showRejectDialog"
    :application="applicationToReject"
    :is-rejecting="isRejecting"
    @update:visible="(value) => !value && closeRejectDialog()"
    @confirm="confirmReject"
  />
</template>
