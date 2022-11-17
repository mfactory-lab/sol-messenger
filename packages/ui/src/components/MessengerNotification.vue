<script lang="ts" setup>
const notifications = ref(22)

const isNotifications = computed(() => notifications.value > 0)
const tooltipText = computed(
  () => `users in ${notifications.value} chats are waiting for confirmation`,
)
</script>

<template>
  <div
    class="panel-notifications"
    :class="{ 'has-notifications': isNotifications }"
  >
    <custom-tooltip :text="tooltipText" />
    <icon-bell class="ring" :color="isNotifications ? 'FF5C5C' : 'AABEC8'" />
    <span>{{ notifications }}</span>
  </div>
</template>

<style lang='scss'>
.has-notifications {
  span {
    color: #ff5c5c;
  }

  .ring {
  animation: ring 4s .7s ease-in-out ;
  transform-origin: 50% 4px;
}

}

@keyframes ring {
  0% {
    transform: rotate(0);
  }
  1% {
    transform: rotate(30deg);
  }
  3% {
    transform: rotate(-28deg);
  }
  5% {
    transform: rotate(34deg);
  }
  7% {
    transform: rotate(-32deg);
  }
  9% {
    transform: rotate(30deg);
  }
  11% {
    transform: rotate(-28deg);
  }
  13% {
    transform: rotate(26deg);
  }
  15% {
    transform: rotate(-24deg);
  }
  17% {
    transform: rotate(22deg);
  }
  19% {
    transform: rotate(-20deg);
  }
  21% {
    transform: rotate(18deg);
  }
  23% {
    transform: rotate(-16deg);
  }
  25% {
    transform: rotate(14deg);
  }
  27% {
    transform: rotate(-12deg);
  }
  29% {
    transform: rotate(10deg);
  }
  31% {
    transform: rotate(-8deg);
  }
  33% {
    transform: rotate(6deg);
  }
  35% {
    transform: rotate(-4deg);
  }
  37% {
    transform: rotate(2deg);
  }
  39% {
    transform: rotate(-1deg);
  }
  41% {
    transform: rotate(1deg);
  }

  43% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(0);
  }
}
</style>
