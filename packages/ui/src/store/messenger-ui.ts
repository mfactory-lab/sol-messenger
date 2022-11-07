import type { ChannelMembership } from '@app/sdk'
import { isChannelMembershipStatusPending } from '@app/sdk'
import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'
import { shortenAddress } from '@/utils'

export const useMessengerUiStore = defineStore('messenger-ui', () => {
  const { notify } = useQuasar()
  const wallet = useWallet()

  const {
    state,
    postMessage,
    addMember, deleteMember, authorizeMember,
    createChannel, loadChannel, deleteChannel, joinChannel,
  } = useMessengerStore()
  const userStore = useUserStore()

  const membersDialog = ref(false)
  const showDebug = ref(false)
  const toggleDebug = useToggle(showDebug)

  const joinChannelState = reactive({
    dialog: false,
    loading: false,
    name: '',
    authority: '',
  })

  const addMemberState = reactive({
    dialog: false,
    loading: false,
    name: '',
    authority: '',
    key: '',
  })

  const authorizeMemberState = reactive({
    loading: false,
  })

  const deleteMemberState = reactive({
    loading: false,
  })

  const newChannelState = reactive({
    dialog: false,
    name: '',
    maxMessages: 15,
  })

  const postMessageState = reactive({
    message: '',
  })

  const isWalletConnected = computed(() => !!wallet.publicKey.value)
  const isAuthorizedMember = computed(() => state.channelMembership?.status.__kind === 'Authorized')
  const isPendingMember = computed(() => state.channelMembership?.status.__kind === 'Pending')
  const isChannelCreator = computed(() => isAuthorizedMember.value
    && state.channel?.creator.toString() === String(wallet.publicKey.value ?? '-'))
  const channels = computed(() => state.allChannels)

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
  const currentChanel = computed(() => state.channel)

  const allowSend = computed(() => isAuthorizedMember.value && !state.sending)
  const canAddMember = computed(() => isAuthorizedMember.value)
  const canDeleteMember = (member: any) => computed(() => isChannelCreator.value
    && String(member.key) !== String(userStore.keypair?.publicKey)).value
  const canJoinChannel = computed(() => isWalletConnected.value && !state.loading && !isAuthorizedMember.value)

  const ok = (message: string) => notify({ type: 'positive', message, timeout: 2000 })
  const info = (message: string) => notify({ type: 'info', message, timeout: 2000 })
  const error = (message: string) => notify({ type: 'negative', message, timeout: 2000 })

  const pendingMemberCount = computed(() => {
    return state.channelMembers.filter(acc => isChannelMembershipStatusPending(acc.data.status)).length
  })

  async function sendMessage() {
    if (checkWalletConnected()) {
      await postMessage(postMessageState.message)
      postMessageState.message = ''
    }
  }

  function addNewChannel() {
    if (checkWalletConnected()) {
      newChannelState.dialog = true
    }
  }

  async function handleNewChannel() {
    if (checkWalletConnected()) {
      try {
        await createChannel(newChannelState.name, newChannelState.maxMessages)
        handleNewChannelReset()
        ok('Channel was created!')
      } catch (e) {
        error('Something went wrong')
        console.log(e)
      }
    }
  }

  function handleNewChannelReset() {
    newChannelState.dialog = false
    newChannelState.name = ''
    newChannelState.maxMessages = 15
  }

  async function handleAddMember() {
    addMemberState.loading = true
    if (!state.channelAddr) {
      info('Please select a channel')
      return
    }
    try {
      await addMember(addMemberState.authority, addMemberState.key, addMemberState.name)
      handleAddMemberReset()
      ok('Member was added')
    } catch (e) {
      error('Something went wrong')
      console.log(e)
    } finally {
      addMemberState.loading = false
    }
  }

  function handleAddMemberReset() {
    addMemberState.loading = false
    addMemberState.name = ''
    addMemberState.authority = ''
    addMemberState.key = ''
  }

  async function handleDeleteMember(key: any) {
    try {
      deleteMemberState.loading = true
      await deleteMember(key)
      ok('Member was deleted')
    } catch (e) {
      error('Something went wrong')
      console.log(e)
    } finally {
      deleteMemberState.loading = false
    }
  }

  async function handleAuthorizeMember(key: any) {
    try {
      authorizeMemberState.loading = true
      await authorizeMember(key)
      ok('Member was authorized')
    } catch (e) {
      error('Something went wrong')
      console.log(e)
    } finally {
      authorizeMemberState.loading = false
    }
  }

  async function handleJoinChannel() {
    if (!state.channelAddr) {
      info('Please select a channel')
      return
    }
    joinChannelState.loading = true
    try {
      await joinChannel(state.channelAddr, joinChannelState.name)
      handleJoinChannelReset()
      ok('Request was sent')
    } catch (e) {
      console.log('Error', e)
      error('Something went wrong')
    } finally {
      joinChannelState.loading = false
    }
  }

  function handleJoinChannelReset() {
    joinChannelState.loading = false
    joinChannelState.dialog = false
    joinChannelState.name = ''
  }

  async function handleDeleteChannel() {
    if (!state.channelAddr) {
      info('Please select a channel')
      return
    }
    await deleteChannel(state.channelAddr)
    try {
      await deleteChannel(state.channelAddr)
      ok('Channel was deleted!')
    } catch (e) {
      console.log('Error', e)
      error('Something went wrong')
    } finally {
      joinChannelState.loading = false
    }
  }

  async function selectChannel(addr: any) {
    membersDialog.value = false // @todo fix autoopen dialog when switch channel
    await loadChannel(addr)
  }

  function checkWalletConnected() {
    if (!wallet.publicKey.value) {
      info('Please connect wallet')
      return false
    }
    return true
  }

  function getStatusColor(status: any) {
    if (status?.__kind === 'Authorized') {
      return 'positive'
    }
    return 'grey'
  }

  function formatMemberName(member: ChannelMembership) {
    if (member?.name && member.name !== '') {
      return member.name
    }
    return shortenAddress(member.authority)
  }

  function isSomeoneMessage(sender: any) {
    const pubkey = wallet.publicKey.value
    if (!pubkey) {
      return true
    }
    return String(pubkey) !== String(sender)
  }

  const channelFilter = reactive({
    text: '',
  })

  const onSearch = (val: string) => {
    channelFilter.text = val
  }

  return {
    state,
  }
})
