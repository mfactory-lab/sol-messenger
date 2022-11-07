import { useQuasar } from 'quasar'
import { ref, toRef } from 'vue'
import type { Commitment } from '@solana/web3.js'
import { DEFAULT_CONFIRM_TIMEOUT, DEFAULT_MONITOR_COMMITMENT, DEFAULT_SEND_TIMEOUT } from '@/config'

export function useMonitorTransaction() {
  const connectionStore = useConnectionStore()
  const { notify } = useQuasar()

  const cluster = toRef(connectionStore, 'cluster')
  const sending = ref(false)

  async function monitorTransaction(
    signatureOrPromise: Promise<string> | string,
    {
      onSuccess,
      onError,
      idx,
      commitment = DEFAULT_MONITOR_COMMITMENT,
      sendTimeout = DEFAULT_SEND_TIMEOUT,
      confirmTimeout = DEFAULT_CONFIRM_TIMEOUT,
    }: MonitorTransactionParams = {},
  ): Promise<void> {
    idx = idx ?? ''

    let dismiss = notify({
      progress: true,
      type: 'ongoing',
      message: idx ? `Sending transaction "${idx}" ...` : 'Sending transaction...',
      timeout: sendTimeout,
    })

    const closeAction = {
      label: 'Close',
      color: 'white',
    }

    sending.value = true

    let signature = ''
    try {
      signature = String(await signatureOrPromise)
    } catch (e: any) {
      sending.value = false
      dismiss()
      if (!String(e?.message).startsWith('User rejected')) {
        notify({
          message: idx ? `Transaction "${idx}" error` : 'Transaction error',
          caption: e?.message,
          type: 'negative',
          timeout: 0,
          actions: [closeAction],
        })
      }
      return
    }

    // https://solscan.io/tx/{id}
    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${cluster.value}`

    const exploreAction = {
      label: 'Explore',
      color: 'white',
      target: '_blank',
      href: explorerUrl,
      onClick: () => false,
    }

    try {
      dismiss()

      dismiss = notify({
        // spinner: true,
        progress: true,
        type: 'ongoing',
        message: idx ? `Confirming transaction "${idx}" ...` : 'Confirming transaction...',
        actions: [exploreAction],
        timeout: confirmTimeout,
      })

      const latestBlockHash = await connectionStore.connection.getLatestBlockhash()

      const res = await connectionStore.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature,
      }, commitment)

      dismiss()

      if (res.value.err) {
        // console.error(res.value.err);
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(JSON.stringify(res.value.err))
      }

      dismiss = notify({
        message: idx ? `Transaction "${idx}" confirmed` : 'Transaction confirmed',
        type: 'positive',
        actions: [exploreAction],
      })

      if (onSuccess) {
        onSuccess(signature)
      }
    } catch (e: any) {
      dismiss()
      notify({
        message: idx ? `Transaction "${idx}" error` : 'Transaction error',
        caption: e.message,
        type: 'negative',
        timeout: 0,
        actions: [exploreAction, closeAction],
      })

      if (onError) {
        onError(e)
      }
      console.error(e)
    } finally {
      sending.value = false
    }
  }

  return { monitorTransaction, sending }
}

interface MonitorTransactionParams {
  onSuccess?: (signature: string) => void
  onError?: (reason: string) => void
  commitment?: Commitment
  sendTimeout?: number
  confirmTimeout?: number
  idx?: string
}
