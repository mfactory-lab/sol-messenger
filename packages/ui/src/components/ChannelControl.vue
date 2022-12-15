<script setup lang="ts">
import { PlusIcon, RefreshIcon, SearchIcon } from 'vue-tabler-icons'
import { useQuasar } from 'quasar'

defineProps({
  isLoading: { type: Boolean },
})
const channelEmit = defineEmits([
  'createChannel',
  'joinChannel',
  'refreshList',
])

const channelStore = useChannelStore()
const { isWalletConnected } = useHelper()

const { notify } = useQuasar()

/* const canJoinChannel = computed<boolean>(
  () => channelStore.canJoinChannel && !channelStore.isPublicChannel,
) */
const isPendingMember = computed<boolean>(() => channelStore.isPendingMember)
const canCreateChannel = computed<boolean>(() => channelStore.canCreateChannel)

const handleEmit = (emit: 'createChannel' | 'joinChannel' | 'refreshList') => {
  if (!channelStore.isWalletConnected) {
    notify({
      message: 'Please connect wallet',
      color: 'negative',
      position: 'top',
    })
    return
  }
  channelEmit(emit)
}
</script>

<template>
  <q-item class="channel-control-wrapper q-pa-none">
    <q-item-section class="button-wrapper">
      <q-btn
        class="control-button"
        :class="{ 'refresh-btn': isLoading }"
        square
        flat
        @click="handleEmit('refreshList')"
      >
        <refresh-icon style="color: #fff" />
        <custom-tooltip text="Refresh channels" />
      </q-btn>
      <q-btn
        class="control-button"
        square
        flat
        @click="handleEmit('createChannel')"
      >
        <plus-icon style="color: #fff" />
        <custom-tooltip text="Create a channel" />
      </q-btn>
      <!-- v-if="canJoinChannel && !channelStore.isChannelLoading" -->
      <q-btn
        class="control-button"
        square
        flat
        @click="handleEmit('joinChannel')"
      >
        <search-icon style="color: #fff" />
        <custom-tooltip text="Browse channels" />
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<style scoped lang="scss">
.button-wrapper {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-direction: row;

  @media (max-width: $breakpoint-xs) {
    padding: 1px;
  }

  .control-button {
    width: 33%;
    height: 42px;
    background: #516670;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
