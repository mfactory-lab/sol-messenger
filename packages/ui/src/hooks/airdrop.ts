import type { PublicKey } from '@solana/web3.js'
import {
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'
import { AIRDROP_SOL } from '@/config/common'

export function useAirdrop() {
  const { connection } = useConnectionStore()
  const { userBalance } = useUserStore()
  const wallet = useWallet()
  const { notify } = useQuasar()

  const isAirdrop = ref(false)

  const airdropSol = async () => {
    try {
      const airdrop = await connection.requestAirdrop(wallet.publicKey.value as PublicKey, AIRDROP_SOL * LAMPORTS_PER_SOL)
      await connection.confirmTransaction(airdrop)
      notify({
        type: 'positive',
        message: `you got ${AIRDROP_SOL} sol`,
        timeout: 2000,
        position: 'bottom',
      })
      isAirdrop.value = true
      await userBalance()
    } catch (err) {
      console.log(err)
      notify({
        type: 'negative',
        message: String(err),
        position: 'bottom',
        actions: [
          { label: 'Dismiss', color: 'white', handler: () => { /* ... */ } },
        ],
      })
    }
  }
  return {
    isAirdrop,
    airdropSol,
  }
}
