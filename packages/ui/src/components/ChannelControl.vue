<script setup lang="ts">
defineProps({
  isLoading: { type: Boolean },
})
const channelEmit = defineEmits(['createChannel', 'joinChannel', 'refreshList'])

const channelStore = useChannelStore()
const { isWalletConnected } = useHelper()

/* const canJoinChannel = computed<boolean>(
  () => channelStore.canJoinChannel && !channelStore.isPublicChannel,
) */
const isPendingMember = computed<boolean>(() => channelStore.isPendingMember)
const canCreateChannel = computed<boolean>(() => channelStore.canCreateChannel)

const handleEmit = (emit: 'createChannel' | 'joinChannel' | 'refreshList') => {
  if (!channelStore.isWalletConnected) {
    isWalletConnected()
    return
  }
  channelEmit(emit)
}
</script>

<template>
  <q-item>
    <q-item-section class="button-wrapper">
      <q-btn
        class="control-button"
        :class="{ 'refresh-btn': isLoading }"
        square
        flat
        @click="handleEmit('refreshList')"
      >
        <img src="@/assets/img/refresh.svg" alt="refresh">
        <custom-tooltip text="Refresh list" />
      </q-btn>
      <q-btn
        class="control-button"
        square
        flat
        @click="handleEmit('createChannel')"
      >
        <img src="@/assets/img/add.svg" alt="create">
        <custom-tooltip text="Create a channel" />
      </q-btn>
      <!-- v-if="canJoinChannel && !channelStore.isChannelLoading" -->
      <q-btn
        class="control-button"
        square
        flat
        @click="handleEmit('joinChannel')"
      >
        <img src="@/assets/img/join.svg" alt="join">
        <custom-tooltip text="Join the channel" />
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<style scoped lang="scss">
.q-item {
  padding: 8px;
}

.button-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  gap: 9px;

  .control-button {
    width: 44px;
    height: 44px;
    background: #516670;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}

.refresh-btn {
  img {
    animation: RotateArrow 1s linear infinite;
  }
}

@keyframes RotateArrow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}
</style>
