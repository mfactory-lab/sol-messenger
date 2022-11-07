import { isChannelMembershipStatusPending } from '@app/sdk'
import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'

function useNotify() {
  const { notify } = useQuasar()
  const ok = (message: string) => notify({ type: 'positive', message, timeout: 2000 })
  const info = (message: string) => notify({ type: 'info', message, timeout: 2000 })
  const error = (message: string) => notify({ type: 'negative', message, timeout: 2000 })
  return { ok, info, error }
}

export function useMessenger() {
  const wallet = useWallet()

  const {
    state,
  } = useMessengerStore()
  const userStore = useUserStore()

  const isWalletConnected = computed(() => !!wallet.publicKey.value)
  const isAuthorizedMember = computed(() => state.channelMembership?.status.__kind === 'Authorized')
  const isPendingMember = computed(() => state.channelMembership?.status.__kind === 'Pending')
  const isChannelCreator = computed(() => isAuthorizedMember.value
    && state.channel?.creator.toString() === String(wallet.publicKey.value ?? '-'))
  const channels = computed(() => state.allChannels)

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
    channels,
    canJoinChannel,
    canDeleteMember,
    canAddMember,
    allowSend,
    pendingMemberCount,
    messages,
  }
}

export function useNewChannel() {
  const { createChannel } = useMessengerStore()
  const { ok, error } = useNotify()

  const state = reactive({
    dialog: false,
    name: '',
    maxMessages: 15,
  })

  async function submit() {
    if (checkWalletConnected()) {
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

export function useAddMember() {
  const { state: messengerState, addMember } = useMessengerStore()
  const { ok, info, error } = useNotify()

  const state = reactive({
    dialog: false,
    loading: false,
    name: '',
    authority: '',
    key: '',
  })

  async function submit() {
    state.loading = true
    if (!messengerState.channelAddr) {
      info('Please select a channel')
      return
    }
    try {
      await addMember(state.authority, state.key, state.name)
      reset()
      ok('Member was added')
    } catch (e) {
      error('Something went wrong')
      console.log(e)
    } finally {
      state.loading = false
    }
  }

  function reset() {
    state.loading = false
    state.name = ''
    state.authority = ''
    state.key = ''
  }

  return {
    state,
    submit,
    reset,
  }
}

export function useJoinChannel() {
  const state = reactive({
    dialog: false,
    loading: false,
    name: '',
    authority: '',
  })
}
