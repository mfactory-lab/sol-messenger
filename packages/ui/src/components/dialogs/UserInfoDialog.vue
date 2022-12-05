<script setup lang="ts">
import type { ChannelDevice } from '@app/sdk'
import { evaClose, evaCopyOutline } from '@quasar/extras/eva-icons'
import type { PublicKey } from '@solana/web3.js'
import type { PropType } from '@vue/runtime-core'
import { copyToClipboard } from 'quasar'

const props = defineProps({
  devices: Object as PropType<
    { data: ChannelDevice; pubkey: PublicKey }[]
  >,
  authorityDevice: String,
})

const emit = defineEmits(['regenerate', 'channelAuthorityDevice', 'loadChannel'])

const userStore = useUserStore()
const { ok } = useHelper()

const addDevice = useAddDevice()
const deleteDevice = useDeleteDevice()

const selectDevicekey = ref()

const isAuthorityDevice = computed(() => props.authorityDevice === selectDevicekey.value?.toBase58())

const copy = () => copyToClipboard(String(userStore.keypair?.publicKey ?? ''))

const handleSelect = (val: PublicKey) => (selectDevicekey.value = val)

const handleAddDevice = (key: string) => {
  addDevice.submit(key)
}

const handleExport = () => {
  userStore.exportKey()
}

const handleImport = (key: string) => {
  userStore.importKey(key)
  setTimeout(() => emit('loadChannel'), 1000)
}

const handleDelete = (key: PublicKey) => {
  deleteDevice.submit(key)
}
</script>

<template>
  <q-dialog
    class="dialog-wrapper"
    transition-duration="150"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card square flat>
      <q-card-section class="row items-center q-pa-xs">
        <q-space />
        <q-btn v-close-popup flat round dense :icon="evaClose" />
      </q-card-section>
      <q-card-section class="q-py-none">
        <div class="text-body1 text-blue-grey-8 text-left">
          Device Key
        </div>
        <q-btn flat round dense :icon="evaCopyOutline" @click="copy">
          <q-tooltip
            :delay="0"
            anchor="bottom middle"
            self="top middle"
            transition-duration="0"
          >
            Copy to clipboard
          </q-tooltip>
        </q-btn>
        <span class="text-body2">{{ userStore.keypair?.publicKey }}</span>
      </q-card-section>
      <q-separator />

      <q-card-section>
        <devices-list
          :devices="devices"
          :authority-device="authorityDevice"
          :select-devicekey="selectDevicekey"
          :delete-loading="deleteDevice.state.loading"
          @handle-select="handleSelect"
          @handle-delete="handleDelete"
        />
      </q-card-section>
      <q-separator />

      <q-card-actions align="right">
        <devices-control
          :add-loading="addDevice.state.loading"
          :is-authority-device="isAuthorityDevice"
          @handle-export="handleExport"
          @handle-add-device="handleAddDevice"
          @handle-import="handleImport"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.dialog-wrapper {
  width: 500px;
  max-width: 80vw;
}
.q-card__actions .q-btn.dialog-submit-btn {
  padding: 0 14px;
}

.delete-device-btn {
  display: none;
}

.active {
  .delete-device-btn {
    display: block;
  }
}
</style>
