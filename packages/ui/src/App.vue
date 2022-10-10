<script lang="ts">
import { defineComponent } from 'vue'

import {
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'

import { WalletMultiButton, initWallet, useWallet } from 'solana-wallets-vue'

import 'solana-wallets-vue/styles.css'
import { Keypair, PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'
import { bytesToBase58 } from '@app/sdk/src/crypto/utils'
// import { generateCEK } from '../crypto'

const walletOptions = {
  wallets: [
    new PhantomWalletAdapter(),
    new SlopeWalletAdapter(),
    new SolflareWalletAdapter(),
  ],
  autoConnect: true,
}
initWallet(walletOptions)

const wallet = useWallet()

export default defineComponent({
  components: {
    WalletMultiButton,
  },
  methods: {
    async handleSign() {
      // stored in account
      const nonce = 'secret123'
      const nonceUint8 = new TextEncoder().encode(nonce)

      if (!wallet.signMessage.value) {
        return
      }

      const signature = await wallet.signMessage.value(nonceUint8)

      console.log('signature:', bytesToBase58(signature.slice(0, 32)))
      console.log('signature:', bytesToBase58(signature.slice(32)))

      const key = Keypair.fromSeed(signature.slice(32))

      console.log(key.secretKey)

      const pubKeyUint8 = wallet?.publicKey.value!.toBytes()

      const isVerified = nacl.sign.detached.verify(nonceUint8, signature, pubKeyUint8)

      console.log(isVerified)

      // ...
    },
  },
})
</script>

<template>
  <div>
    hello world
    <WalletMultiButton />

    <br>

    <button class="swv-button sign-button" @click="handleSign">
      Test sign
    </button>
  </div>
</template>

<style>
.sign-button {
  background-color: darkcyan;
}
</style>
