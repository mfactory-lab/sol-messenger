<script setup lang="ts">
import { PhantomWalletName, SolflareWalletName } from '@solana/wallet-adapter-wallets'
import type { Wallet } from 'solana-wallets-vue'
import { useWallet } from 'solana-wallets-vue'
import { useQuasar } from 'quasar'
import { evaClose } from '@quasar/extras/eva-icons'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { shortenAddress } from '@/utils'

import cloverSvg from '@/assets/img/wallets/clover.svg'
import ledgerDarkSvg from '@/assets/img/wallets/ledger.svg'
import mathWalletDarkSvg from '@/assets/img/wallets/mathwallet.svg'

interface WalletSettings {
  priority: Record<string, number>
  icons: Record<string, string>
  darkIcons: Record<string, string>
  deepLinks: Record<string, string>
}

// Customize wallets
const settings: WalletSettings = {
  priority: {
    solflare: 10,
    phantom: 20,
    sollet: 5,
    nufi: 5,
    blocto: 1,
  },
  icons: {
    clover: cloverSvg,
  },
  darkIcons: {
    ledger: ledgerDarkSvg,
    mathwallet: mathWalletDarkSvg,
  },
  deepLinks: {
    phantom: 'https://phantom.app/ul/browse/{uri}?ref={ref}',
    solflare: 'https://solflare.com/ul/browse/{uri}?ref={ref}',
  },
}

const { userAgent, isWebView, isMobileOs } = useMobileDetect()

const icons = {
  close: evaClose,
}

const isActiveWallet = (w: Wallet) =>
  [WalletReadyState.Installed, WalletReadyState.Loadable].includes(
    w.readyState,
  )

const { dark } = useQuasar()
const wallet = useWallet()
const { connected, connecting } = wallet
const { path } = useRoute()

const isMobile = computed(() => isMobileOs.value && !isWebView.value)

if (isWebView.value) {
  const ua = String(userAgent.value).toLowerCase()
  if (ua.includes('phantom')) {
    wallet.select(PhantomWalletName)
    wallet.connect()
  } else if (ua.includes('solflare')) {
    wallet.select(SolflareWalletName)
    wallet.connect()
  }
}

type ExtendedWallet = Wallet & { icon: string; darkIcon: string; deepLink: string }
const walletAddress = computed(() => wallet.publicKey.value?.toBase58() ?? '')
const walletShortAddress = computed(() => shortenAddress(walletAddress.value))
const wallets = computed<ExtendedWallet[]>(() =>
  [...wallet.wallets.value as ExtendedWallet[]]
    .map((w) => {
      const key = w.adapter.name.toLowerCase()
      w.adapter.icon = settings.darkIcons[key] ?? settings.icons[key] ?? w.adapter.icon
      // only show deep links on mobile
      if (isMobile.value && settings.deepLinks[key]) {
        w.deepLink = settings.deepLinks[key]!
          .replace('{uri}', location.href)
          .replace('{ref}', location.origin)
      }
      return w
    })
    .sort((a, b) => {
      const aPriority = settings.priority[a.adapter.name.toLowerCase()] ?? 1
      const bPriority = settings.priority[b.adapter.name.toLowerCase()] ?? 1
      return (
        bPriority
        - aPriority
        + ((isActiveWallet(b) ? 1 : 0) - (isActiveWallet(a) ? 1 : 0))
      )
    }),
)

const computedWallets = computed(() => isMobile.value ? wallets.value.filter(w => !!w.deepLink) : wallets.value)

const dialog = ref(false)

async function select(w: Wallet) {
  await wallet.select(w.adapter.name)
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
    :ripple="false"
    color="primary-gray"
    text-color="white"
    square
    unelevated
    @click="show"
  >
    {{ walletShortAddress }}
  </q-btn>

  <q-btn
    v-else
    v-bind="$attrs"
    color="primary-gray"
    class="q-pa-none btn"
    text-color="white"
    square
    flat
    :ripple="false"
    :loading="connecting"
    @click="show"
  >
    CONNECT WALLET
  </q-btn>

  <q-dialog
    v-model="dialog"
    transition-duration="150"
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
        {{ walletAddress }}
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="q-gutter-md row justify-between">
          <q-btn class="disconnect-btn" text-color="black" square flat @click="disconnect">
            <span name="wallet">Disconnect</span>
          </q-btn>
          <q-btn class="disconnect-btn" text-color="black" square flat @click="ok">
            <span name="wallet">Ok</span>
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
          :rows="computedWallets"
          row-key="name"
          hide-pagination
          hide-header
          :rows-per-page-options="[100]"
        >
          <template #item="{ row: w }">
            <div :key="`wallet-${w.adapter.name}`" class="col-12 col-md-6">
              <q-item
                clickable
                :href="w.deepLink"
                @click="w.deepLink ? true : select(w)"
              >
                <q-item-section>
                  <b>{{ w.adapter.name }}</b>
                  <div
                    class="text-light-gray text-caption full-width text-no-wrap"
                    style="text-overflow: ellipsis; overflow: hidden"
                  >
                    {{ w.adapter.url }}
                  </div>
                </q-item-section>
                <q-item-section avatar>
                  <q-avatar square>
                    <img :src="w.adapter.icon" :alt="w.adapter.name">
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
  overflow: hidden;
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

