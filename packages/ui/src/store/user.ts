import type { PublicKey } from '@solana/web3.js'
import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import bs58 from 'bs58'
import { useAnchorWallet } from 'solana-wallets-vue'

export const useUserStore = defineStore('user', () => {
  const wallet = useAnchorWallet()
  const keypair = ref<Keypair>()
  const balance = ref()

  watchEffect(async () => {
    const pubkey = wallet.value?.publicKey
    if (pubkey) {
      const secretKey = useLocalStorage(pubkey.toString(), () => bs58.encode(Keypair.generate().secretKey))
      fromEncoded(secretKey.value)
      await userBalance()
    } else {
      keypair.value = undefined
    }
  })

  function fromEncoded(key: string) {
    keypair.value = Keypair.fromSecretKey(bs58.decode(key))
  }

  function generateKey() {
    const pubkey = wallet.value?.publicKey
    if (!pubkey) {
      return
    }
    const secretKey = useLocalStorage(pubkey.toString(), '')
    fromEncoded(secretKey.value = bs58.encode(Keypair.generate().secretKey))
  }

  function importKey(key: string) {
    const pubkey = wallet.value?.publicKey
    if (!pubkey) {
      return
    }
    const secretKey = useLocalStorage(pubkey.toString(), '')
    fromEncoded(secretKey.value = key)
  }

  function exportKey() {
    const pubkey = wallet.value?.publicKey
    if (!pubkey) {
      return
    }
    const backupKey = useLocalStorage(pubkey.toString(), '').value
    const storageObj = { backupKey }
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(storageObj))}`
    const dlAnchorElem = document.createElement('a')
    dlAnchorElem.setAttribute('href', dataStr)
    dlAnchorElem.setAttribute('download', 'backup_key.json')
    dlAnchorElem.click()
  }

  async function userBalance() {
    const _wallet = wallet.value?.publicKey

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
    const walletBalance = await connection.getBalance(_wallet as PublicKey)
    balance.value = await walletBalance / LAMPORTS_PER_SOL
    // return balance > 0.1
  }

  const isUserHaveSol = computed(() => balance.value > 0.1)

  return {
    keypair,
    balance,
    generateKey,
    importKey,
    exportKey,
    isUserHaveSol,
  }
})
