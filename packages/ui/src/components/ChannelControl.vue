<script setup lang="ts">
defineProps({
  isJoining: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
})
defineEmits(['createChannel', 'joinChannel', 'refreshList'])

const channelStore = useChannelStore()
const canJoinChannel = computed<boolean>(
  () => channelStore.canJoinChannel && !channelStore.isPublicChannel,
)
const isPendingMember = computed<boolean>(() => channelStore.isPendingMember)
const canCreateChannel = computed<boolean>(() => channelStore.canCreateChannel)
</script>

<template>
  <q-item>
    <q-item-section class="button-wrapper">
      <q-btn
        class="control-button"
        :class="{ 'refresh-btn': isLoading }"
        square
        flat
        @click="$emit('refreshList')"
      >
        <img src="@/assets/img/refresh.svg" alt="refresh">
        <custom-tooltip text="Refresh list" />
      </q-btn>
      <q-btn
        v-if="canCreateChannel"
        class="control-button"
        square
        flat
        @click="$emit('createChannel')"
      >
        <img src="@/assets/img/add.svg" alt="create">
        <custom-tooltip text="Create a channel" />
      </q-btn>
      <q-btn
        v-if="canJoinChannel && !channelStore.isChannelLoading"
        class="control-button"
        square
        flat
        :loading="isJoining"
        :disable="isPendingMember"
        @click="$emit('joinChannel')"
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
