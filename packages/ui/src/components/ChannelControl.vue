<script setup lang="ts">
import { PlusIcon, RefreshIcon, SearchIcon } from 'vue-tabler-icons'
import { useQuasar } from 'quasar'
import helpIcon from '@/assets/img/help.svg?raw'
import { CGRAM_DOCS_URL } from '@/config/common'

defineProps({
  isLoading: { type: Boolean },
})
const channelEmit = defineEmits([
  'createChannel',
  'joinChannel',
  'refreshList',
])

const channelStore = useChannelStore()

const { notify } = useQuasar()

const handleEmit = (emit: 'createChannel' | 'joinChannel' | 'refreshList') => {
  if (!channelStore.isWalletConnected) {
    notify({
      message: 'Please connect wallet',
      color: 'negative',
      position: 'bottom',
    })
    return
  }
  channelEmit(emit)
}
</script>

<template>
  <q-item class="channel-control-wrapper q-pa-none">
    <q-item-section class="button-wrapper">
      <a class="control-button documentation-link" :href="CGRAM_DOCS_URL" target="_blank">
        <i class="help-icon" v-html="helpIcon" />
        <custom-tooltip text="Documentation" />
      </a>
      <q-btn class="control-button" :class="{ 'refresh-btn': isLoading }" square flat @click="handleEmit('refreshList')">
        <refresh-icon style="color: #fff" />
        <custom-tooltip text="Refresh channels" />
      </q-btn>
      <q-btn class="control-button" square flat @click="handleEmit('createChannel')">
        <plus-icon style="color: #fff" />
        <custom-tooltip text="Create a channel" />
      </q-btn>
      <!-- v-if="canJoinChannel && !channelStore.isChannelLoading" -->
      <q-btn class="control-button" square flat @click="handleEmit('joinChannel')">
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
    width: 70px;
    height: 42px;
    background: $gray;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }

    @media(max-width: $breakpoint-xs) {
      width: 24.6%;
    }
  }
  .documentation-link {
      background: $secondary;
    }
}
</style>

<style lang="scss">
.help-icon {
  width: 24px;
  height: 24px;

  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
