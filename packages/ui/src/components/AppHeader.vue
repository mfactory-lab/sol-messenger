<script setup lang="ts">
import { useQuasar } from 'quasar'

const user = useUserStore()
const { dialog } = useQuasar()

function handleGenerateKey() {
  dialog({
    title: 'Confirm',
    message: 'Are you sure?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    user.generateKey()
  })
}
</script>

<template>
  <q-header class="app-header">
    <div class="container">
      <q-toolbar>
        <div class="app-header__info">
          <div class="app-header__logo">
            <div class="logo-wrapper">
              <router-link to="/" />
            </div>
          </div>

          <div class="app-header__title">
            <h1>BLOCKCHAIN messenger <span class="marked">SOLANA</span> </h1>
          </div>
        </div>

        <q-space />

        <div v-if="user.keypair" class="user-device">
          <div>
            <b>Device Key</b>
            &nbsp;
            <q-btn size="xs" rounded unelevated @click="handleGenerateKey">
              regenerate
            </q-btn>
          </div>
          <q-badge>{{ user.keypair?.publicKey }}</q-badge>
        </div>

        <div class="app-header__right">
          <div class="app-header__buttons">
            <cluster-selector class="app-header__cluster-btn header-btn" />
            <connect-wallet class="app-header__wallet-btn header-btn" />
          </div>
        </div>
      </q-toolbar>
    </div>
  </q-header>
</template>

<style lang="scss">
.user-device {
  padding-right: 30px;
  line-height: 1;
  font-size: 12px;

  > div {
    text-transform: uppercase;
    margin: 0 0 5px;
  }
  span {
    color: $primary;
  }
}
</style>
