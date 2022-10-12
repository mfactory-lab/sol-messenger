<script lang="ts" setup>
defineProps({
  code: {
    type: Number,
    default: 500,
  },
  message: {
    type: String,
    default: 'An unexpected error occurred',
  },
})
</script>

<template>
  <div class="error-page">
    <div class="container">
      <div class="error-page__code">
        {{ code }}
      </div>
      <div class="error-page__message">
        {{ message }}
      </div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  &__code {
    font-size: 20vh;
    font-weight: 900;
  }
  .container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;
  }
}
</style>
