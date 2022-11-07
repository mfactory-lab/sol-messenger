import { isChannelMembershipStatusPending } from '@app/sdk'
import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'

const DEFAULT_MAX_MESSAGES = 15

export function useChannel() {
  const wallet = useWallet()

  const { state } = useMessengerStore()
  const userStore = useUserStore()

  const isWalletConnected = computed(() => !!wallet.publicKey.value)
  const isAuthorizedMember = computed(() => state.channelMembership?.status.__kind === 'Authorized')
  const isPendingMember = computed(() => state.channelMembership?.status.__kind === 'Pending')
  const isChannelCreator = computed(() => isAuthorizedMember.value
    && state.channel?.creator.toString() === String(wallet.publicKey.value ?? '-'))

  const allowSend = computed(() => isAuthorizedMember.value && !state.sending)
  const canAddMember = computed(() => isAuthorizedMember.value)
  const canDeleteMember = (member: any) => computed(() => isChannelCreator.value
    && String(member.key) !== String(userStore.keypair?.publicKey)).value
  const canJoinChannel = computed(() => isWalletConnected.value && !state.loading && !isAuthorizedMember.value)

  const pendingMemberCount = computed(() => {
    return state.channelMembers.filter(acc => isChannelMembershipStatusPending(acc.data.status)).length
  })

  const messages = computed(() => {
    const data = []
    let i = 0; let prev
    for (const msg of state.channelMessages) {
      if (prev && `${msg.sender}` === `${prev}`) {
        data[i - 1].text.push(msg.content)
      } else {
        prev = msg.sender
        data.push({
          id: msg.id,
          sender: msg.sender,
          senderFormatted: msg.senderFormatted,
          text: [msg.content],
          date: msg.createdAt,
        })
        i++
      }
    }
    return data
  })

  return {
    isWalletConnected,
    isAuthorizedMember,
    isPendingMember,
    isChannelCreator,
    canJoinChannel,
    canDeleteMember,
    canAddMember,
    allowSend,
    pendingMemberCount,
    messages,
  }
}

export function useChannelDelete() {
  const { state: messengerState, deleteChannel } = useMessengerStore()
  const { info, ok, error } = useHelper()

  const state = reactive({
    loading: false,
  })

  async function submit() {
    if (!messengerState.channelAddr) {
      info('Please select a channel')
      return
    }
    try {
      state.loading = true
      await deleteChannel(messengerState.channelAddr)
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

export function useChannelCreate() {
  const { createChannel } = useMessengerStore()
  const { isWalletConnected, ok, error } = useHelper()

  const state = reactive({
    dialog: false,
    name: '',
    maxMessages: DEFAULT_MAX_MESSAGES,
  })

  async function submit() {
    if (isWalletConnected()) {
      try {
        await createChannel(state.name, state.maxMessages)
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
    state.name = ''
    state.maxMessages = 15
  }

  return {
    state,
    submit,
    reset,
  }
}

export function useChannelAuthorizeMember() {
  const { authorizeMember } = useMessengerStore()
  const { ok, error } = useHelper()

  const state = reactive({
    loading: false,
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
    }
    return false
  }

  return {
    state,
    submit,
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
