import type { Channel, ChannelMembership, Message } from '@app/sdk'
import { MessengerClient } from '@app/sdk'
import type { Address } from '@project-serum/anchor'
import { AnchorProvider } from '@project-serum/anchor'
import type { Keypair } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { defineStore } from 'pinia'
import { useAnchorWallet } from 'solana-wallets-vue'
import { shortenAddress } from '@/utils'

interface MessengerStoreState {
  allChannels: AllChannels[]
  ownChannels: { pubkey: string; status: string }[]
  channel?: Channel
  channelAddr?: PublicKey
  channelMembershipAddr?: PublicKey
  channelMembership?: ChannelMembership
  channelMembers: { pubkey: PublicKey; data: ChannelMembership }[]
  channelMessages: Array<Message & { senderDisplayName: string }>
  channelLoading: boolean
  loading: boolean
  creating: boolean
  sending: boolean
}

const mockEncrypted = (_msg: string) => '***** *** *** *** *******'

export const useMessengerStore = defineStore('messenger', () => {
  const connectionStore = useConnectionStore()
  const userStore = useUserStore()
  const wallet = useAnchorWallet()

  const deviceKey = computed(() => userStore.keypair)

  // const secretKey = useLocalStorage('key', () => bs58.encode(Keypair.generate().secretKey))
  // const keypair = Keypair.fromSecretKey(bs58.decode(secretKey.value))

  const defaultState = {
    allChannels: [],
    ownChannels: [],
    channel: undefined,
    channelAddr: undefined,
    channelMembershipAddr: undefined,
    channelMembership: undefined,
    channelMembers: [],
    channelMessages: [], // decrypted messages list
    channelLoading: false,
    loading: false,
    creating: false,
    sending: false,
  }

  const state = reactive<MessengerStoreState>({ ...defaultState })

  const client = $computed(() => {
    return new MessengerClient(
      new AnchorProvider(
        connectionStore.connection,
        wallet.value ?? { publicKey: PublicKey.default } as never,
        AnchorProvider.defaultOptions(),
      ), userStore.keypair as Keypair)
  })

  let listeners: number[] = []

  watch(wallet, (w) => {
    if (!w) {
      reset()
    } else {
      init().then()
    }
  }, { immediate: true })

  watch([deviceKey, () => state.allChannels], () => {
    initOwnChannels().then()
  }, { immediate: true })

  async function initOwnChannels() {
    const memberships = await client.loadMemberships(userStore.keypair?.publicKey)
    const channels: {
      pubkey: string
      status: 'Authorized' | 'Pending' | 'Unauthorized'
    }[] = memberships.map(v => ({
      pubkey: v.data[0].channel.toBase58(),
      status: v.data[0].status.__kind,
    }))
    /*     DEFAULT_CHANNELS.forEach((pk) => {
      if (!channels.find(ch => ch.pubkey === pk)) {
        channels.push({
          pubkey: pk,
          status: 'Unauthorized',
        })
      }
    }) */
    state.ownChannels = channels
    console.log('myChannels ====== ', state.ownChannels)
  }

  async function initEvents() {
    console.log('Register events...')
    for (const listener of listeners) {
      await client.removeEventListener(listener)
    }
    listeners.push(client.addEventListener('NewMessageEvent', async (e) => {
      console.log('[Event] NewMessageEvent', e)
      if (`${e.channel}` !== `${state.channelAddr}`) {
        return
      }
      let content = e.message.content
      const isEncrypted = client.utils.message.isEncrypted(e.message)
      if (isEncrypted) {
        const cek = await getCEK()
        if (cek) {
          content = await client.decryptMessage(e.message.content, cek)
        } else {
          content = mockEncrypted(e.message.content)
        }
      }
      state.channelMessages.push({
        ...e.message,
        content,
      })
    }))
    listeners.push(client.addEventListener('AuthorizeMemberEvent', async (e) => {
      console.log('[Event] AuthorizeMemberEvent', e)
      if (state.channelAddr && `${e.channel}` !== `${state.channelAddr}`) {
        return
      }
      if (`${e.membership}` === `${state.channelMembershipAddr}`) {
        loadChannel(state.channelAddr!).then()
      } else {
        loadChannelMembers().then()
      }
    }))
    listeners.push(client.addEventListener('JoinChannelEvent', async (e) => {
      console.log('[Event] JoinChannelEvent', e)
      if (`${e.channel}` === `${state.channelAddr}`) {
        loadChannelMembers().then()
      }
    }))
    listeners.push(client.addEventListener('LeaveChannelEvent', async (e) => {
      console.log('[Event] LeaveChannelEvent', e)
      if (`${e.channel}` === `${state.channelAddr}`) {
        loadChannelMembers().then()
      }
    }))
  }

  async function init() {
    reset()
    listeners = []
    state.loading = true
    const channels = await client.loadAllChannels()
    // for (const channel of channels) {
    //   console.log(`Channel: ${channel.pubkey}`)
    //   console.log(channel.data.pretty())
    //   const members = await client.loadChannelMembers(channel.pubkey)
    //   console.log('|-- members:')
    //   for (const member of members) {
    //     console.log(`key: ${member.pubkey}`)
    //     console.log(JSON.stringify(member.data.pretty(), null, 2))
    //   }
    // }
    await initEvents()
    state.allChannels = channels as any
    state.loading = false
    console.log(state)
  }

  function reset() {
    Object.assign(state, defaultState)
  }

  async function createChannel(name: string, opts: any) {
    try {
      state.creating = true
      await client.initChannel({
        name,
        maxMessages: opts.maxMessages ?? 15,
        public: opts.public,
        permissionless: opts.permissionless,
        opts: { commitment: opts.commitment ?? 'confirmed' },
      })

      await init()
      /*       await loadChannel(channel.publicKey)
      if (state.channel) {
        state.allChannels.push({
          pubkey: channel.publicKey,
          data: state.channel,
        })
      } */
    } finally {
      state.creating = false
    }
  }

  async function deleteChannel(addr: Address) {
    const channel = new PublicKey(addr)
    // const key = new PublicKey('2MF6T12ez4Wdzo9AggucE2659bGsrh6n39M8JR9afa6S')
    // const [membership] = await client.getMembershipPDA(channel, key)
    await client.deleteChannel({ channel, opts: { commitment: 'confirmed' } })
    await init()
  }

  async function joinChannel(addr: Address, name: string) {
    const channel = new PublicKey(addr)
    await client.joinChannel({ channel, name, opts: { commitment: 'confirmed' } })
    await loadChannel(addr)
    await refreshList()
  }

  async function loadChannel(addr: Address) {
    state.channelLoading = true
    state.channelMessages = []
    state.channelMembers = []
    state.channelMembershipAddr = undefined
    state.channelMembership = undefined
    state.channelAddr = new PublicKey(addr)

    try {
      if (wallet.value?.publicKey) {
        try {
          const [membershipAddr] = await client.getMembershipPDA(state.channelAddr)
          state.channelMembershipAddr = membershipAddr
          state.channelMembership = await client.loadMembership(membershipAddr)
        } catch (e) {
          console.log(e)
          state.channelMembershipAddr = undefined
          state.channelMembership = undefined
        }
      }
      await loadChannelMembers()
      await loadChannelMessages()
    } catch (e) {
      console.log('Error', e)
    } finally {
      state.channelLoading = false
    }
  }

  async function getCEK(): Promise<Uint8Array | undefined> {
    if (!state.channelMembership) {
      return
    }
    try {
      return await client.decryptCEK(state.channelMembership.cek)
    } catch (e) {
      console.log(e)
    }
  }

  async function loadChannelMessages() {
    if (!state.channelAddr) {
      console.log('Invalid channel')
      return
    }
    state.channel = await client.loadChannel(state.channelAddr)

    const isPublic = client.utils.channel.isPublic(state.channel)

    const cek = !isPublic ? await getCEK() : null

    state.channelMessages = await Promise.all(
      state.channel.messages.map(async (m) => {
        const isEncrypted = client.utils.message.isEncrypted(m)
        let content = isEncrypted ? mockEncrypted(m.content) : m.content
        let senderDisplayName = shortenAddress(m.sender)
        // show sender name only for authorized users
        if (wallet.value?.publicKey) {
          const membership = state.channelMembers.find(({ data }) =>
            data.name !== '' && (`${data.authority}` === `${m.sender}` || `${data.key}` === `${m.sender}`),
          )
          if (membership && membership.data.name !== '') {
            senderDisplayName = membership.data.name
          }
        }
        if (cek) {
          try {
            content = await client.decryptMessage(m.content, cek)
          } catch (e) {
            console.log(`Failed to decrypt message #${m.id}`)
          }
        }
        return { ...m, senderDisplayName, content }
      }),
    )
  }

  async function loadChannelMembers() {
    if (!state.channelAddr) {
      console.error('Invalid channel')
      return
    }
    state.channelMembers = await loadMembers()
  }

  async function loadMembers(addr = state.channelAddr) {
    return await client.loadChannelMembers(addr!)
  }

  async function postMessage(message: string) {
    if (!state.channelAddr) {
      console.log('Please select a channel')
      return
    }
    try {
      state.sending = true
      let isPublic: any
      if (state.channel) {
        isPublic = client.utils.channel.isPublic(state.channel)
      }
      await client.postMessage({
        channel: state.channelAddr,
        message,
        encrypt: !isPublic,
      })
      await loadChannelMessages()
    } finally {
      state.sending = false
    }
  }

  async function addMember(invitee: Address, key?: Address, name?: string, flags?: number) {
    if (!state.channelAddr) {
      console.log('Invalid channel')
      return
    }
    await client.addMember({
      channel: state.channelAddr,
      invitee: new PublicKey(invitee),
      key: key ? new PublicKey(key) : undefined,
      name,
      flags,
      opts: { commitment: 'confirmed' },
    })
  }

  async function deleteMember(addr: Address) {
    if (!state.channelAddr) {
      console.log('Invalid channel')
      return
    }
    await client.deleteMember({
      channel: state.channelAddr,
      key: new PublicKey(addr),
      opts: { commitment: 'finalized' },
    })
    await refreshMembers()
  }

  async function authorizeMember(key: Address) {
    if (!state.channelAddr) {
      console.log('Invalid channel')
      return
    }
    await client.authorizeMember({
      channel: state.channelAddr,
      key: new PublicKey(key),
    })
    await refreshMembers()
  }

  async function refreshList() {
    await init()
  }

  async function refreshMembers() {
    state.channelMembers = await loadMembers()
  }

  async function selectChannel(addr: any) {
    state.channelAddr = addr
  }

  return {
    state,
    client,
    loadChannel,
    joinChannel,
    createChannel,
    deleteChannel,
    postMessage,
    addMember,
    deleteMember,
    authorizeMember,
    refreshList,
    loadMembers,
    selectChannel,
  }
})

export interface AllChannels {
  pubkey: PublicKey
  data: Channel
}
