<script setup>
import { defineProps } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
    isHollow: {
        type: Boolean,
        default: false
    },
    width: {
        type: Number,
        default: 60
    },
    to: {
        type: String,
        default: '/'
    },
    text: String
})
</script>

<template>
    <RouterLink
        type="button"
        :to="to"
        :class="[isHollow ? 'border-solid border-4 border-sky-700 text-sky-700 font-semibold hover:bg-sky-200 hover:text-sky-900' :
                 'bg-sky-700 text-white hover:bg-sky-800 focus:outline-none text-s',
                 'focus:ring-4 focus:ring-sky-300 rounded-full mpx-5 py-2.5 text-center me-2 mb-2', `w-${width}`]"
    >{{ text }}</RouterLink>
</template>