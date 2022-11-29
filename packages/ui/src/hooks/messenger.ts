import type { QNotifyCreateOptions } from 'quasar'
import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'
import type { PublicKey } from '@solana/web3.js'
import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js'

const DEFAULT_MAX_MESSAGES = 15

export async function userBalance() {
  const wallet = useWallet()

  const _wallet = wallet.publicKey.value as PublicKey

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
  const walletBalance = await connection.getBalance(_wallet)
  const balance = await walletBalance / LAMPORTS_PER_SOL

  return balance > 0.1
}

export function useChannelCreate() {
  const { createChannel } = useMessengerStore()
  const { isWalletConnected, ok, error, noSol } = useHelper()

  const state = reactive({
    dialog: false,
    name: '',
    maxMessages: DEFAULT_MAX_MESSAGES,
    public: false,
    permissionless: false,
    loading: false,
  })

  async function submit() {
    if (isWalletConnected()) {
      try {
        if (!await userBalance()) {
          noSol()
          return
        }
        await createChannel(state.name, {
          maxMessages: state.maxMessages,
          public: state.public,
          permissionless: state.permissionless,
        })
        reset()
        ok('Channel was created!')
      } catch (e) {
        error('Something went wrong')
        console.log(e)
      }
    }
  }

  function reset() {
    state.dialog = false
    state.public = false
    state.loading = false
    state.name = ''
    state.maxMessages = 15
  }

  return {
    state,
    submit,
    reset,
  }
}

export function useChannelDelete() {
  const messenger = useMessengerStore()
  const { info, ok, error } = useHelper()

  const state = reactive({
    loading: false,
  })

  async function submit() {
    if (!messenger.state.channelAddr) {
      info('Please select a channel')
      return
    }
    try {
      console.log(await userBalance())
      state.loading = true
      await messenger.deleteChannel(
        messenger.state.channelAddr,
      )
      ok('Channel was deleted!')
    } catch (e) {
      console.log('Error', e)
      error('Something went wrong')
    } finally {
      state.loading = false
    }
  }

  return { state, submit }
}

export function useChannelAuthorizeMember() {
  const { authorizeMember, loadChannel, state: messengerState } = useMessengerStore()
  const { ok, error } = useHelper()

  const state = reactive({
    loading: false,
    dialog: false,
  })

  async function submit(key: any) {
    try {
      state.loading = true
      await authorizeMember(key)
      await loadChannel(messengerState.channelAddr ?? '')
      ok('Member was authorized')
    } catch (e) {
      error('Something went wrong')
      console.log(e)
    } finally {
      state.loading = false
    }
  }

  return { state, submit }
}

export function useChannelAddMember() {
  const { state: messengerState, addMember } = useMessengerStore()
  const { ok, info, error, noSol } = useHelper()

  const state = reactive({
    dialog: false,
    loading: false,
  })

  async function submit(data: { wallet: string; name: string; key: string }) {
    state.loading = true
    if (!messengerState.channelAddr) {
      info('Please select a channel')
      return
    }
    try {
      if (!await userBalance()) {
        noSol()
        return
      }
      await addMember(data.wallet, data.key, data.name)
      ok('Member was added')
      return true
    } catch (e) {
      error('Something went wrong')
      console.log(e)
    } finally {
      state.loading = false
      state.dialog = false
    }
    return false
  }

  function reset() {
    state.loading = false
    state.dialog = false
  }

  return {
    state,
    submit,
    reset,
  }
}

export function useChannelDeleteMember() {
  const { deleteMember, loadChannel, state: messengerState } = useMessengerStore()
  const { ok, error } = useHelper()

  const state = reactive({
    loading: false,
  })

  async function submit(key: any) {
    try {
      state.loading = true
      await deleteMember(key)
      await loadChannel(messengerState.channelAddr ?? '')
      ok('Member was deleted')
    } catch (e) {
      error('Something went wrong')
      console.log(e)
    } finally {
      state.loading = false
    }
  }

  return { state, submit }
}

export function useChannelJoin() {
  const { state: messengerState, joinChannel } = useMessengerStore()
  const { ok, info, error, noSol } = useHelper()

  const state = reactive({
    dialog: false,
    loading: false,
    name: '',
  })

  async function submit() {
    if (!messengerState.channelAddr) {
      info('Please select a channel')
      return
    }
    state.loading = true
    try {
      if (!await userBalance()) {
        noSol()
        return
      }
      await joinChannel(messengerState.channelAddr, state.name)
      reset()
      ok('Request was sent')
    } catch (e) {
      console.log('Error', e)
      error('Something went wrong')
    } finally {
      state.loading = false
    }
  }

  function reset() {
    state.loading = false
    state.dialog = false
    state.name = ''
  }

  return {
    state,
    submit,
    reset,
  }
}

/**
 * Private helper hook
 */
export function useHelper() {
  const wallet = useWallet()

  const { airdropSol } = useAirdropStore()

  const { notify } = useQuasar()
  const info = (message: string) => notify({ type: 'info', message, timeout: 2000 })
  const error = (message: string) => notify({ type: 'negative', message, timeout: 2000 })
  const ok = (message: string, position = 'bottom' as keyof QNotifyCreateOptions['position']) => notify({
    type: 'positive',
    message,
    timeout: 2000,
    position,
  })
  const noSol = () => notify({
    type: 'warning',
    message: 'You don\'t have enough SOL on your balance!',
    position: 'top',
    timeout: 0,
    actions: [
      {
        label: 'GET SOL',
        class: 'btn--no-hover',
        padding: '0 15px 0 10px',
        size: '14px',
        color: 'black',
        handler: () => airdropSol(),
      },
    ],
  })

  function isWalletConnected() {
    if (!wallet.publicKey.value) {
      info('Please connect wallet')
      return false
    }
    return true
  }

  return { ok, info, error, noSol, isWalletConnected }
}
