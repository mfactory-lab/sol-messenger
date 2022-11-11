<script setup lang="ts">
import { copyToClipboard } from 'quasar'
import { evaClose, evaCopyOutline } from '@quasar/extras/eva-icons'
defineEmits(['regenerate'])
const userStore = useUserStore()
const copy = () => {
  copyToClipboard((userStore.keypair?.publicKey ?? '').toString())
}
</script>

<template>
  <q-dialog class="dialog-wrapper">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          Device Key
        </div>
        <q-space />
        <q-btn v-close-popup flat round dense :icon="evaClose" />
      </q-card-section>
      <q-card-section>
        <q-btn flat round dense :icon="evaCopyOutline" @click="copy">
          <q-tooltip :delay="0" anchor="bottom middle" self="top middle" transition-duration="0">
            Copy to clipboard
          </q-tooltip>
        </q-btn>
        <span>{{ userStore.keypair?.publicKey }}</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn class="dialog-submit-btn" text-color="white" rounded @click="userStore.generateKey">
          Regenerate
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.dialog-wrapper {
  width: 700px;
  max-width: 80vw;
}
.q-card__actions .q-btn.dialog-submit-btn {
  padding: 0 14px;
}
</style>
