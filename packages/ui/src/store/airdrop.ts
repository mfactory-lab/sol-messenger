import type { PublicKey } from '@solana/web3.js'
import {
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { defineStore } from 'pinia'
import { useWallet } from 'solana-wallets-vue'

export const useAirdropStore = defineStore('airdrop', () => {
  const { connection } = useConnectionStore()
  const { ok } = useHelper()
  const wallet = useWallet()

  const isAirdrop = ref(false)

  const airdropSol = async () => {
    try {
      const airdrop = await connection.requestAirdrop(wallet.publicKey.value as PublicKey, 1 * LAMPORTS_PER_SOL)
      await connection.confirmTransaction(airdrop)
      ok('you got 1 sol', 'top')
      isAirdrop.value = true
    } catch (err) {
      console.log(err)
    }
  }
  return {
    isAirdrop,
    airdropSol,
  }
})
