<script lang="ts" setup>
const { pendingChannels, showInfo, showDialog } = useNotifications()
const { state } = useNotificationsStore()

const notifications = $computed(() => pendingChannels.value?.length ?? 0)
const isNotifications = computed(() => notifications > 0)

const infoWidth = computed(() => {
  return showInfo.value
    ? 'width: 100%; padding-right: 14px'
    : 'width: 0; padding-right: 0;'
})

const showPendingDialog = () => {
  if (!isNotifications.value) {
    return
  }
  state.showDialog = !state.showDialog
}
</script>

<template>
  <div
    class="panel-notifications"
    :class="{ 'has-notifications': isNotifications }"
    @click="showPendingDialog"
  >
    <div class="panel-notifications__info">
      <icon-bell class="ring" :color="isNotifications ? 'FF5C5C' : 'AABEC8'" />
      <span>{{ notifications }}</span>
    </div>

    <div
      ref="notificationsInfo"
      class="panel-notifications__details"
      :style="infoWidth"
    >
      channels are awaiting user confirmation
    </div>

    <pending-users-dialog
      v-model="state.showDialog"
      :pending-channels="pendingChannels"
      @close-dialog="isShow.value = false"
    />
  </div>
</template>

<style lang='scss'>
.has-notifications {
  span {
    color: #ff5c5c;
  }

  .ring {
    animation: ring 90s 0.7s ease-in-out infinite;
    transform-origin: 50% 4px;
  }
}

@keyframes ring {
  0% {
    transform: rotate(0);
  }
  0.02% {
    transform: rotate(30deg);
  }
  0.09% {
    transform: rotate(-28deg);
  }
  0.16% {
    transform: rotate(34deg);
  }
  0.23% {
    transform: rotate(-32deg);
  }
  0.30% {
    transform: rotate(30deg);
  }
  0.37% {
    transform: rotate(-28deg);
  }
  0.44% {
    transform: rotate(26deg);
  }
  0.51% {
    transform: rotate(-24deg);
  }
  0.58% {
    transform: rotate(22deg);
  }
  0.65% {
    transform: rotate(-20deg);
  }
  0.72% {
    transform: rotate(18deg);
  }
  0.79% {
    transform: rotate(-16deg);
  }
  0.86% {
    transform: rotate(14deg);
  }
  0.93% {
    transform: rotate(-12deg);
  }
  1% {
    transform: rotate(10deg);
  }
  1.07% {
    transform: rotate(-8deg);
  }
  1.14% {
    transform: rotate(6deg);
  }
  1.21% {
    transform: rotate(-4deg);
  }
  1.28% {
    transform: rotate(2deg);
  }
  1.35% {
    transform: rotate(-1deg);
  }
  1.42% {
    transform: rotate(1deg);
  }

  1.49% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(0);
  }
}
</style>
