<script setup lang="ts">
import { evaClose, evaCopyOutline } from '@quasar/extras/eva-icons'
import { FileDownloadIcon, FileImportIcon } from 'vue-tabler-icons'
import { copyToClipboard } from 'quasar'

defineEmits(['regenerate'])

const userStore = useUserStore()

const selectDevicekey = ref('')

const copy = () => copyToClipboard(String(userStore.keypair?.publicKey ?? ''))
</script>

<template>
  <q-dialog
    class="dialog-wrapper"
    transition-duration="150"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card square flat>
      <q-card-section class="row items-center">
        <div class="text-h6 text-center">
          Device Key
        </div>
        <q-space />
        <q-btn v-close-popup flat round dense :icon="evaClose" />
      </q-card-section>
      <q-separator />
      <q-card-section>
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
        <span>{{ userStore.keypair?.publicKey }}</span>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="text-h6 text-left">
          Devices
        </div>
        <q-list>
          <q-item
            active-class="bg-blue-grey-8 text-white"
            class="devices-item"
            clickable
            :active="selectDevicekey === 1"
            @click="selectDevicekey = 1"
          >
            {{ userStore.keypair?.publicKey }}
          </q-item>
        </q-list>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <div class="q-gutter-md row justify-between">
          <!-- @click="userStore.generateKey" -->
          <q-btn
            class="disconnect-btn"
            text-color="black"
            square
            flat
          >
            add new
          </q-btn>
          <file-import-icon />
          <file-download-icon />
        </div>
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

.devices-item {
  align-items: center;
  font-size: 12px;
  min-height: 0;
}
</style>
