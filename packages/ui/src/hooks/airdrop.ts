import type { PublicKey } from '@solana/web3.js'
import {
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'

export function useAirdrop() {
  const { connection } = useConnectionStore()
  const wallet = useWallet()
  const { notify } = useQuasar()

  const isAirdrop = ref(false)

  const airdropSol = async () => {
    try {
      const airdrop = await connection.requestAirdrop(wallet.publicKey.value as PublicKey, 1 * LAMPORTS_PER_SOL)
      await connection.confirmTransaction(airdrop)
      notify({
        type: 'positive',
        message: 'you got 1 sol',
        timeout: 2000,
        position: 'top',
      })
      isAirdrop.value = true
    } catch (err) {
      console.log(err)
    }
  }
  return {
    isAirdrop,
    airdropSol,
  }
}
