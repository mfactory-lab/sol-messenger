import { Keypair } from '@solana/web3.js'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import bs58 from 'bs58'
import { useAnchorWallet } from 'solana-wallets-vue'

export const useUserStore = defineStore('user', () => {
  const wallet = useAnchorWallet()
  const keypair = ref<Keypair>()

  watchEffect(() => {
    const pubkey = wallet.value?.publicKey
    if (pubkey) {
      const secretKey = useLocalStorage(pubkey.toString(), () => bs58.encode(Keypair.generate().secretKey)).value
      keypair.value = Keypair.fromSecretKey(bs58.decode(secretKey))
    }
  })

  return {
    keypair,
  }
})
