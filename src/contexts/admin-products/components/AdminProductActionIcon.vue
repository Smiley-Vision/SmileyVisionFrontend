<script setup>
const props = defineProps({
  variant: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <svg
    v-if="props.variant === 'create'"
    viewBox="0 0 240 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient
        id="create-blue"
        x1="56"
        y1="52"
        x2="184"
        y2="188"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#0EA5E9" />
        <stop offset="1" stop-color="#075985" />
      </linearGradient>
    </defs>
    <rect x="96" y="40" width="48" height="160" rx="16" fill="url(#create-blue)" />
    <rect x="40" y="96" width="160" height="48" rx="16" fill="url(#create-blue)" />
  </svg>

  <svg
    v-else-if="props.variant === 'modify'"
    viewBox="0 0 240 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient
        id="pencil-body"
        x1="72"
        y1="176"
        x2="174"
        y2="62"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#0EA5E9" />
        <stop offset="1" stop-color="#075985" />
      </linearGradient>
    </defs>
    <g transform="rotate(-45 120 120)">
      <rect x="86" y="48" width="68" height="122" rx="14" fill="url(#pencil-body)" />
      <rect x="86" y="170" width="68" height="18" rx="6" fill="#082F49" />
      <rect x="86" y="48" width="68" height="20" rx="8" fill="#0C4A6E" />
      <path d="M86 188H154L120 220L86 188Z" fill="#BFDBFE" />
      <path d="M108 204L120 220L132 204H108Z" fill="#075985" />
    </g>
  </svg>

  <svg
    v-else
    viewBox="0 0 240 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="w-full h-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="box-top" x1="50" y1="60" x2="168" y2="116" gradientUnits="userSpaceOnUse">
        <stop stop-color="#BAE6FD" />
        <stop offset="1" stop-color="#7DD3FC" />
      </linearGradient>
      <linearGradient
        id="box-left"
        x1="40"
        y1="106"
        x2="132"
        y2="192"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#38BDF8" />
        <stop offset="1" stop-color="#0EA5E9" />
      </linearGradient>
      <linearGradient
        id="box-right"
        x1="128"
        y1="102"
        x2="200"
        y2="186"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#0EA5E9" />
        <stop offset="1" stop-color="#0369A1" />
      </linearGradient>
    </defs>
    <path d="M40 92L120 52L200 92L120 132L40 92Z" fill="url(#box-top)" />
    <path d="M40 92V176L120 216V132L40 92Z" fill="url(#box-left)" />
    <path d="M200 92V176L120 216V132L200 92Z" fill="url(#box-right)" />
    <path d="M76 74L157 114" stroke="#0369A1" stroke-width="10" stroke-linecap="round" />
  </svg>
</template>
