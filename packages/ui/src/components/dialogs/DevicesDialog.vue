<script setup lang="ts">
import {
  evaClose,
  evaCopyOutline,
} from '@quasar/extras/eva-icons'
import type { PublicKey } from '@solana/web3.js'
import { Screen, copyToClipboard } from 'quasar'
import { shortenAddress } from '@/utils'

const props = defineProps({
  authorityDevice: String,
})

const emit = defineEmits([
  'regenerate',
  'channelAuthorityDevice',
  'loadChannel',
])

const userStore = useUserStore()
const { state } = useMessengerStore()

const addDevice = useAddDevice()
const deleteDevice = useDeleteDevice()

const selectDevicekey = ref()

const isAuthorityDevice = computed(
  () => props.authorityDevice === selectDevicekey.value?.toBase58(),
)

const copy = () => copyToClipboard(String(userStore.keypair?.publicKey ?? ''))

const devices = computed(() => state.memberDevices)

const userDeviceKey = computed(() =>
  Screen.xs
    ? shortenAddress(String(userStore.keypair?.publicKey), 12)
    : userStore.keypair?.publicKey,
)

const handleSelect = (val: PublicKey) => (selectDevicekey.value = val)

function handleAddDevice(key: string) {
  addDevice.submit(key)
}

function handleExport() {
  userStore.exportKey()
}

function handleImport(key: string) {
  userStore.importKey(key)
  setTimeout(() => emit('loadChannel'), 1000)
}

function handleDelete(key: PublicKey) {
  deleteDevice.submit(key)
}
</script>

<template>
  <q-dialog
    transition-duration="150"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card square flat class="dialog-wrapper">
      <q-card-section class="row items-center q-pb-none q-pr-sm q-pt-sm">
        <q-space />

        <q-btn v-close-popup size="10px" flat round dense :icon="evaClose" />
      </q-card-section>
      <q-card-section class="q-py-none">
        <div class="text-body1 text-blue-grey-8 text-left">
          Device Key
        </div>
        <div class="text-left q-pb-xs">
          <q-btn class="copy-btn" size="12px" flat round dense :icon="evaCopyOutline" @click="copy">
            <custom-tooltip text="Copy to clipboard" />
          </q-btn>
          <span class="text-body2" :title="String(userStore.keypair?.publicKey)">{{
            userDeviceKey
          }}</span>
        </div>
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
          :devices="devices"
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
  width: 460px;
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
.short-addres {
  white-space: nowrap;
  overflow: hidden;
  padding: 5px;
  text-overflow: ellipsis;
}

.copy-btn {
  transform: translateX(-5px)
}
</style>
