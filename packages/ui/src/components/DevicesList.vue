<script lang="ts" setup>
import type { ChannelDevice } from '@app/sdk'
import { evaClose } from '@quasar/extras/eva-icons'
import type { PublicKey } from '@solana/web3.js'
import type { PropType } from '@vue/runtime-core'

const props = defineProps({
  selectDevicekey: Object as PropType<PublicKey>,
  deleteLoading: Boolean,
  devices: Object as PropType<ChannelDevice[]>,
  authorityDevice: String,
})

const emit = defineEmits(['handleSelect', 'handleDelete'])

const handleSelect = (val: PublicKey) => emit('handleSelect', val)
const handleDelete = (val: PublicKey) => emit('handleDelete', val)

const isAuthorityDevice = (key: PublicKey) => {
  return key.toBase58() === props.authorityDevice
}
</script>

<template>
  <div class="text-body1 text-blue-grey-8 text-left device">
    Devices
  </div>
  <q-list bordered separator class="devices-list">
    <q-item
      v-for="d in devices"
      :key="d"
      active-class="bg-blue-grey-8 text-white active"
      class="devices-item"
      :class="{ 'authority-device': isAuthorityDevice(d.data.key) }"
      clickable
      :active="selectDevicekey === d.data.key"
      @click="handleSelect(d.data.key)"
    >
      <span class="devices-item__key">
        <custom-tooltip
          v-if="isAuthorityDevice(d.data.key)"
          text="Authority device"
        />
        {{ d.data.key }}
      </span>
      <q-space />
      <q-icon
        v-if="!isAuthorityDevice(d.data.key)"
        :name="evaClose"
        size="18px"
        class="delete-device-btn"
        @click="handleDelete(d.data.key)"
      >
        <custom-tooltip text="Delete device" />
      </q-icon>
    </q-item>
  </q-list>

  <q-inner-loading :showing="deleteLoading" />
</template>

<style lang="scss" scoped>
.device {
  margin-bottom: 10px;
}
.devices {
  &-list {
    height: 360px;
    overflow-y: scroll;
  }

  &-item {
    align-items: center;
    font-size: 12px;
    min-height: 0;

    &__key {
      white-space: nowrap;
      overflow: hidden;
      padding: 5px;
      text-overflow: ellipsis;
    }
  }
}

.authority-device {
  background: #00838f;
  color: #fff;
}
</style>
