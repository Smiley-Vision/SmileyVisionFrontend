<script setup>
defineProps({
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 border-y border-slate-200">
    <div class="px-5 py-7">
      <div class="text-[#075985] text-[1.35rem] md:text-[1.75rem] font-bold mb-[0.8rem]">
        Teléfono celular
      </div>
      <div class="flex items-center gap-[0.6rem] text-slate-600 text-[1.2rem] font-medium">
        <i class="pi pi-phone text-[#075985]"></i>
        <span>{{ phone }}</span>
      </div>
    </div>
    <div class="px-5 py-7 border-t border-slate-200 md:border-t-0 md:border-l">
      <div class="text-[#075985] text-[1.35rem] md:text-[1.75rem] font-bold mb-[0.8rem]">
        Correo electrónico
      </div>
      <div class="flex items-center gap-[0.6rem] text-slate-600 text-[1.2rem] font-medium">
        <i class="pi pi-envelope text-[#075985]"></i>
        <span>{{ email }}</span>
      </div>
    </div>
  </div>
</template>
