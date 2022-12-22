import type { PublicKey } from '@solana/web3.js'
import type { QNotifyCreateOptions } from 'quasar'
import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'

export const DEFAULT_MAX_MESSAGES = 15

export function useChannelCreate() {
  const { createChannel, state: messengerState } = useMessengerStore()
  const { isWalletConnected, ok, error, noSol } = useHelper()

  const userStore = useUserStore()

  const state = reactive({
    dialog: false,
    name: '',
    memberName: '',
    maxMessages: DEFAULT_MAX_MESSAGES,
    public: false,
    permissionless: false,
    loading: false,
  })

  async function submit() {
    if (isWalletConnected()) {
      try {
        state.loading = true

        if (messengerState.allChannels.find(ch => ch.data.name === state.name)) {
          error('A channel with the same name already exists')
          return
        }

        if (!userStore.isUserHaveSol) {
          noSol()
          return
        }

        await createChannel(state.name, state.memberName, {
          maxMessages: state.maxMessages,
          public: state.public,
          permissionless: state.permissionless,
        })
        reset()
        ok('Channel was created!')
      } catch (e) {
        error(`${e}`)
        console.log(e)
      } finally {
        state.loading = false
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
      state.loading = true
      await messenger.deleteChannel(
        messenger.state.channelAddr,
      )
      ok('Channel was deleted!')
    } catch (e) {
      console.log('Error', e)
      error(`Error: ${e}`)
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

  async function submit(authority: PublicKey) {
    try {
      state.loading = true
      await authorizeMember(authority)
      await loadChannel(messengerState.channelAddr ?? '')
      ok('Member was authorized')
    } catch (e) {
      error(`Error: ${e}`)
      console.log(e)
    } finally {
      state.loading = false
    }
  }

  return { state, submit }
}

export function useChannelAddMember() {
  const { state: messengerState, addMember, loadChannel } = useMessengerStore()
  const { ok, info, error, noSol } = useHelper()
  const userStore = useUserStore()

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
      if (!userStore.isUserHaveSol) {
        noSol()
        return
      }
      await addMember(data.wallet, data.key, data.name)
      await loadChannel(messengerState.channelAddr ?? '')
      ok('Member was added')
      return true
    } catch (e) {
      error(`Error: ${e}`)
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
      error(`Error: ${e}`)
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
  const userStore = useUserStore()

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
      if (!userStore.isUserHaveSol) {
        noSol()
        return
      }
      await joinChannel(messengerState.channelAddr, state.name)
      reset()
      ok('Request was sent')
    } catch (e) {
      console.log('Error', e)
      error(`Error: ${e}`)
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

export function useChannelLeave() {
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
      state.loading = true
      await messenger.leaveChannel(
        messenger.state.channelAddr,
      )
      ok('Channel was abandoned!')
    } catch (e) {
      console.log('Error', e)
      error(`Error: ${e}`)
    } finally {
      state.loading = false
    }
  }

  return { state, submit }
}

export function useAddDevice() {
  const messenger = useMessengerStore()
  const { ok, error, noSol } = useHelper()
  const userStore = useUserStore()

  const state = reactive({
    loading: false,
  })

  async function submit(key: string) {
    try {
      state.loading = true
      if (!userStore.isUserHaveSol) {
        noSol()
        return
      }
      await messenger.addDevice(key)
      ok('device added')
    } catch (err) {
      error('Invalid Device Key')
    } finally {
      state.loading = false
    }
  }

  return { state, submit }
}

export function useDeleteDevice() {
  const messenger = useMessengerStore()
  const { ok } = useHelper()

  const state = reactive({
    loading: false,
  })

  async function submit(key: PublicKey) {
    try {
      state.loading = true
      await messenger.deleteDevice(key)
      ok('device removed')
    } finally {
      state.loading = false
    }
  }

  return { state, submit }
}

/**
 * Private helper hook
 */
export function useHelper() {
  const wallet = useWallet()

  const { airdropSol } = useAirdrop()

  const { notify } = useQuasar()
  const info = (message: string) => notify({ type: 'info', position: 'bottom', message, timeout: 4000 })
  const error = (message: string) => notify({ type: 'negative', position: 'bottom', message, timeout: 4000 })
  const ok = (message: string, position = 'bottom' as keyof QNotifyCreateOptions['position']) => notify({
    type: 'positive',
    message,
    timeout: 4000,
    position,
  })
  const noSol = () => notify({
    type: 'warning',
    message: 'Your wallet has insufficient SOL balance',
    position: 'bottom',
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
