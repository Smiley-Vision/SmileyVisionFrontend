<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'

import type { RegistrationApplication } from '@/modules/registration/interfaces/RegistrationApplication'

defineProps<{
  application: RegistrationApplication
  isAccepting: boolean
}>()

defineEmits<{
  accept: [application: RegistrationApplication]
  reject: [application: RegistrationApplication]
}>()
</script>

<template>
  <Card
    class="overflow-hidden rounded-[14px] border border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
    :pt="{ body: { class: '!p-0' }, content: { class: '!p-0' } }"
  >
    <template #content>
      <div class="flex flex-col gap-4 p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700"
            >
              <i class="pi pi-user" style="font-size: 1.1rem"></i>
            </div>
            <div class="min-w-0">
              <div class="truncate font-semibold text-sky-900">{{ application.email }}</div>
              <div class="text-xs text-slate-400">{{ application.sent_at }}</div>
            </div>
          </div>
        </div>

        <div
          class="relative rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600"
        >
          <i class="pi pi-quote-left absolute left-2 top-2 text-slate-300" style="font-size: 0.8rem"></i>
          <p class="pl-4 italic">{{ application.message }}</p>
        </div>

        <div class="flex justify-end gap-3 pt-1">
          <Button
            label="Rechazar"
            severity="danger"
            outlined
            size="small"
            :disabled="isAccepting"
            @click="$emit('reject', application)"
          />
          <Button
            label="Aceptar"
            severity="success"
            size="small"
            :loading="isAccepting"
            @click="$emit('accept', application)"
          />
        </div>
      </div>
    </template>
  </Card>
</template>
