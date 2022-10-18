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
      const secretKey = useLocalStorage(pubkey.toString(), () => bs58.encode(Keypair.generate().secretKey))
      keypair.value = Keypair.fromSecretKey(bs58.decode(secretKey.value))
    } else {
      keypair.value = undefined
    }
  })

  function generateKey() {
    const pubkey = wallet.value?.publicKey
    if (!pubkey) {
      return
    }
    const secretKey = useLocalStorage(pubkey.toString(), '')
    secretKey.value = bs58.encode(Keypair.generate().secretKey)
    keypair.value = Keypair.fromSecretKey(bs58.decode(secretKey.value))
  }

  return {
    keypair,
    generateKey,
  }
})
