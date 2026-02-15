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
        default: 12
    },
    to: {
        type: String,
        default: '/'
    },
    text: String
})

const isExternalLink = (url) => {
    return /^(http|https):\/\//.test(url);
}
</script>

<template>
    <!-- Render RouterLink for internal links -->
    <RouterLink
        v-if="!isExternalLink(to)"
        :to="to"
        :class="[isHollow ? 'border-solid border-4 border-sky-700 text-sky-700 font-semibold hover:bg-sky-200 hover:text-sky-900' :
                 'bg-gradient-to-r from-sky-400 to-sky-700 text-white hover:from-sky-600 hover:to-sky-900 text-s',
                 'focus:ring-4 focus:outline-none focus:ring-sky-300 rounded-full mpx-5 py-2.5 text-center me-2 mb-2']"
        :style="{ width: `${width}rem` }"
    >{{ text }}</RouterLink>

    <!-- Render a regular anchor tag for external links -->
    <a
        v-else
        :href="to"
        target="_blank"
        rel="noopener noreferrer"
        :class="[isHollow ? 'border-solid border-4 border-sky-700 text-sky-700 font-semibold hover:bg-sky-200 hover:text-sky-900' :
                    'bg-gradient-to-r from-sky-400 to-sky-700 text-white hover:from-sky-600 hover:to-sky-900 text-s',
                    'focus:ring-4 focus:outline-none focus:ring-sky-300 rounded-full mpx-5 py-2.5 text-center me-2 mb-2']"
        :style="{ width: `${width}rem` }"
    >
        {{ text }}
    </a>
</template>