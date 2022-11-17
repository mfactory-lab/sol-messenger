<script lang="ts" setup>
defineProps({ color: { type: String, default: 'AABEC8' } })
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="16"
    fill="none"
    xmlns:v="https://vecta.io/nano"
  >
    <path
      d="M5.352 14.359h3.294c0 .821-.59 1.641-1.647 1.641s-1.647-.82-1.647-1.641zm8.434-3.467l-.911-1.515a3.68 3.68 0 0 1-.527-1.897V5.325C12.348 2.389 9.949 0 7 0S1.651 2.389 1.651 5.325v2.155a3.68 3.68 0 0 1-.527 1.897l-.911 1.515c-.278.461-.285 1.018-.018 1.487s.749.749 1.29.749h11.03a1.47 1.47 0 0 0 1.291-.749 1.46 1.46 0 0 0-.021-1.487z"
      :fill="`#${color}`"
    />
  </svg>
</template>
