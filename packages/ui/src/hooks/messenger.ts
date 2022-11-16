import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'

const DEFAULT_MAX_MESSAGES = 15

export function useChannelCreate() {
  const { createChannel } = useMessengerStore()
  const { isWalletConnected, ok, error } = useHelper()

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
  const { authorizeMember } = useMessengerStore()
  const { ok, error } = useHelper()

  const state = reactive({
    loading: false,
    dialog: false,
  })

  async function submit(key: any) {
    try {
      state.loading = true
      await authorizeMember(key)
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
  const { ok, info, error } = useHelper()

  const state = reactive({
    dialog: false,
    loading: false,
  })

  async function submit(data: { authority: string; name: string; key: string }) {
    state.loading = true
    if (!messengerState.channelAddr) {
      info('Please select a channel')
      return
    }
    try {
      await addMember(data.authority, data.key, data.name)
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
  const { deleteMember } = useMessengerStore()
  const { ok, error } = useHelper()

  const state = reactive({
    loading: false,
  })

  async function submit(key: any) {
    try {
      state.loading = true
      await deleteMember(key)
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
  const { ok, info, error } = useHelper()

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
function useHelper() {
  const wallet = useWallet()

  const { notify } = useQuasar()
  const ok = (message: string) => notify({ type: 'positive', message, timeout: 2000 })
  const info = (message: string) => notify({ type: 'info', message, timeout: 2000 })
  const error = (message: string) => notify({ type: 'negative', message, timeout: 2000 })

  function isWalletConnected() {
    if (!wallet.publicKey.value) {
      info('Please connect wallet')
      return false
    }
    return true
  }

  return { ok, info, error, isWalletConnected }
}
