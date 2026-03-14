<script setup>
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'

defineProps({
    form: {
        type: Object,
        required: true
    },
    cityOptions: {
        type: Array,
        required: true
    },
    idPrefix: {
        type: String,
        required: true
    }
})
</script>

<template>
    <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
        <div class="flex flex-col gap-1">
            <label :for="`${idPrefix}_city_id`">Ciudad</label>
            <Select
                :id="`${idPrefix}_city_id`"
                v-model="form.city_id"
                :options="cityOptions"
                optionLabel="label"
                optionValue="value"
                required
            />
        </div>
        <div class="flex flex-col gap-1">
            <label :for="`${idPrefix}_district`">Colonia</label>
            <InputText :id="`${idPrefix}_district`" v-model="form.district" required />
        </div>
    </div>

    <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
        <div class="flex flex-col gap-1">
            <label :for="`${idPrefix}_street`">Calle</label>
            <InputText :id="`${idPrefix}_street`" v-model="form.street" required />
        </div>
        <div class="flex flex-col gap-1">
            <label :for="`${idPrefix}_external_number`">Número exterior</label>
            <InputText :id="`${idPrefix}_external_number`" v-model="form.external_number" required />
        </div>
    </div>

    <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
        <div class="flex flex-col gap-1">
            <label :for="`${idPrefix}_between_a`">Entre calle A</label>
            <InputText :id="`${idPrefix}_between_a`" v-model="form.between_a" required />
        </div>
        <div class="flex flex-col gap-1">
            <label :for="`${idPrefix}_between_b`">Entre calle B</label>
            <InputText :id="`${idPrefix}_between_b`" v-model="form.between_b" required />
        </div>
    </div>

    <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
        <div class="flex flex-col gap-1">
            <label :for="`${idPrefix}_internal_number`">Número interior (opcional)</label>
            <InputText :id="`${idPrefix}_internal_number`" v-model="form.internal_number" />
        </div>
        <div class="flex flex-col gap-1">
            <label :for="`${idPrefix}_postal_code`">Código postal</label>
            <InputText :id="`${idPrefix}_postal_code`" v-model="form.postal_code" required />
        </div>
    </div>

    <div class="flex flex-col gap-1">
        <label :for="`${idPrefix}_notes`">Referencias</label>
        <Textarea :id="`${idPrefix}_notes`" v-model="form.notes" rows="3" required />
    </div>

    <div class="flex items-center gap-2">
        <Checkbox :inputId="`${idPrefix}_is_default`" v-model="form.is_default" binary />
        <label :for="`${idPrefix}_is_default`">Marcar como dirección principal</label>
    </div>
</template>
