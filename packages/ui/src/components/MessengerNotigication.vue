<script lang="ts" setup>
const notifications = ref(22)

const isNotifications = computed(() => notifications.value > 0)
const tooltipText = computed(() => `users in ${notifications.value} chats are waiting for confirmation`)
</script>

<template>
  <div
    class="panel-notifications"
    :class="{ 'has-notufucations': isNotifications }"
  >
    <custom-tooltip :text="tooltipText" />
    <bell-icon :color="isNotifications ? 'FF5C5C' : 'AABEC8'" />
    <span>{{ notifications }}</span>
  </div>
</template>

<style lang='scss'>
.has-notufucations {
  span {
    color: #ff5c5c;
  }
}
</style>
