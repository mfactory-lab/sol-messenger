<script setup lang="ts">
import type { Wallet } from 'solana-wallets-vue'
import { useWallet } from 'solana-wallets-vue'
import { useQuasar } from 'quasar'
import { evaClose } from '@quasar/extras/eva-icons'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { shortenAddress } from '@/utils'

import ledgerDarkSvg from '@/assets/img/wallets/ledger.svg'
import mathWalletDarkSvg from '@/assets/img/wallets/mathwallet.svg'

// custom wallet sort order
const walletPriority: Record<string, number> = {
  solflare: 10,
  phantom: 20,
  sollet: 5,
  nufi: 5,
  blocto: 1,
}

const darkIcons = {
  ledger: ledgerDarkSvg,
  mathwallet: mathWalletDarkSvg,
}

const icons = {
  close: evaClose,
}

const isActiveWallet = (w: Wallet) => [WalletReadyState.Installed, WalletReadyState.Loadable].includes(w.readyState)

const { dark } = useQuasar()
const wallet = useWallet()
const { connected, connecting } = wallet

const walletAddress = computed(() => wallet.publicKey.value?.toBase58() ?? '')
const walletShortAddress = computed(() => shortenAddress(walletAddress.value))
const wallets = computed<Wallet[]>(() =>
  [...wallet.wallets.value]
    .map((w) => {
      // @ts-expect-error ...
      w.darkIcon = darkIcons[w.name.toLowerCase()]
      return w
    })
    .sort((a, b) => {
      const aPriority = walletPriority[a.name.toLowerCase()] ?? 1
      const bPriority = walletPriority[b.name.toLowerCase()] ?? 1
      return (
        bPriority - aPriority + ((isActiveWallet(b) ? 1 : 0) - (isActiveWallet(a) ? 1 : 0))
      )
    }),
)
const dialog = ref(false)

async function select(w: Wallet) {
  await wallet.select(w.name)
  dialog.value = false
  await wallet.connect()
}

function disconnect() {
  dialog.value = false
  wallet.disconnect()
}

function show() {
  dialog.value = true
}

function ok() {
  dialog.value = false
}
</script>

<template>
  <q-btn
    v-if="connected"
    v-bind="$attrs"
    :class="$style.btn"
    :ripple="false"
    color="primary-gray"
    text-color="white"
    rounded
    unelevated
    @click="show"
  >
    {{ walletShortAddress }}
  </q-btn>

  <q-btn
    v-else
    v-bind="$attrs"
    color="primary-gray"
    text-color="white"
    rounded
    unelevated
    :ripple="false"
    :loading="connecting"
    @click="show"
  >
    CONNECT WALLET
  </q-btn>

  <q-dialog
    v-model="dialog"
    transition-duration="100"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card v-if="connected">
      <q-card-section class="relative-position">
        <div class="text-h6 text-center">
          Your wallet
        </div>
        <q-btn
          padding="md"
          color="transparent"
          text-color="primary-gray"
          unelevated
          class="absolute-right"
          :icon="icons.close"
          size="md"
          @click="ok"
        />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <copy-to-clipboard :text="walletAddress" />
        {{ walletAddress }}
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="q-gutter-md row justify-between">
          <q-btn outline rounded @click="disconnect">
            Disconnect
          </q-btn>
          <q-btn outline rounded @click="ok">
            Ok
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <q-card v-else class="wallet-connect-card">
      <q-card-section>
        <div class="text-h6">
          Connect to a wallet
        </div>
        <q-btn
          padding="md"
          color="transparent"
          text-color="primary-gray"
          unelevated
          class="absolute-right"
          :icon="icons.close"
          size="md"
          @click="ok"
        />
      </q-card-section>
      <q-separator />
      <q-card-section style="max-height: 80vh" class="scroll">
        <q-table
          grid
          :rows="wallets"
          row-key="name"
          hide-pagination
          hide-header
          :rows-per-page-options="[100]"
        >
          <template #item="{ row: w }">
            <div :key="`wallet-${w.name}`" class="col-12 col-md-6">
              <q-item clickable :disable="!isActiveWallet(w)" @click="select(w)">
                <q-item-section>
                  <b>{{ w.name }}</b>
                  <div
                    class="text-light-gray text-caption full-width text-no-wrap"
                    style="text-overflow: ellipsis; overflow: hidden"
                  >
                    {{ w.url }}
                  </div>
                </q-item-section>
                <q-item-section avatar>
                  <q-avatar square>
                    <img
                      :src="$q.dark.isActive ? w.icon : w.darkIcon ?? w.icon"
                      alt=""
                    >
                  </q-avatar>
                </q-item-section>
              </q-item>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.wallet-connect-card {
  .q-item {
    border: 1px solid #f5f5f5;
    margin: 3px;
    b {
      font-weight: 500;
    }
    &:hover {
      border-color: #e8e8e8;
    }
  }
}
</style>

<style lang="scss" module>
.btn {
  white-space: nowrap;
  flex-wrap: nowrap;
  img {
    height: 0.6em;
    margin-right: 0.2em;
  }
}
</style>
