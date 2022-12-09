import type { Channel, ChannelDevice, ChannelMembership, Message } from '@app/sdk'
import { MessengerClient } from '@app/sdk'
import type { Address } from '@project-serum/anchor'
import { AnchorProvider } from '@project-serum/anchor'
import type { Keypair } from '@solana/web3.js'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'

import { defineStore } from 'pinia'
import { useAnchorWallet } from 'solana-wallets-vue'
import { shortenAddress } from '@/utils'

interface MessengerStoreState {
  allChannels: AllChannels[]
  ownChannels: { pubkey: string; status: number }[]
  channel?: Channel
  channelAddr?: PublicKey
  channelMembershipAddr?: PublicKey
  channelMembership?: ChannelMembership
  channelMembers: { pubkey: PublicKey; data: ChannelMembership }[]
  channelMessages: Array<Message & { senderDisplayName: string }>
  channelLoading: boolean
  memberDevices: Array<ChannelDevices>
  deleteFromChannel?: { channel: String; address: String }
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
    memberDevices: [],
    deleteFromChannel: undefined,
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
    const memberships = await client.loadMemberships()
    const channels: {
      pubkey: string
      status: number
    }[] = memberships.map(v => ({
      pubkey: v.data.channel.toBase58(),
      status: v.data.status,
    }))

    state.ownChannels = channels
  }

  async function initEvents() {
    console.log('Register events...')
    for (const listener of listeners) {
      await client.removeEventListener(listener)
    }
    listeners.push(client.addEventListener('DeleteMemberEvent', async (e) => {
      if (`${e.authority}` !== `${wallet.value?.publicKey}`) {
        return
      }
      const { channel } = e
      const deleteFromThisChannel = state.allChannels.find(ch => ch.pubkey.toBase58() === channel.toBase58())
      state.deleteFromChannel = { channel: deleteFromThisChannel!.data.name, address: channel.toBase58() }
      await initOwnChannels()
      if (`${state.channelAddr}` === `${channel}`) {
        state.channelMessages = []
        state.channel = undefined
      }
    }))
    listeners.push(client.addEventListener('DeleteChannelEvent', async (e) => {
      const { channel } = e

      const channelIndex = state.ownChannels.findIndex(ch => ch.pubkey === channel.toBase58())
      if (channelIndex !== 0) {
        state.allChannels.splice(channelIndex, 1)
        state.channelMessages = []
        state.channel = undefined
      }
    }))
    listeners.push(client.addEventListener('NewMessageEvent', async (e, slot, sig) => {
      console.log('[Event] NewMessageEvent', e)
      if (`${e.channel}` !== `${state.channelAddr}`) {
        return
      }
      let content = e.message.content
      const isEncrypted = client.utils.message.isEncrypted(e.message)
      if (isEncrypted) {
        try {
          const cek = await getCEK()
          content = cek ? await client.decryptMessage(e.message.content, cek) : mockEncrypted(e.message.content)
        } catch (err) {
          console.log('Error:', err)
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
      if (`${e.authority}` === `${wallet.value?.publicKey}`) {
        initOwnChannels()
      }
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
      const { channel } = await client.initChannel({
        name,
        maxMessages: Number(opts.maxMessages),
        public: opts.public,
        permissionless: opts.permissionless,
      })

      // await init()
      await loadChannel(channel.publicKey)
      if (state.channel) {
        state.allChannels.push({
          pubkey: channel.publicKey,
          data: state.channel,
        })
      }
    } finally {
      state.creating = false
    }
  }

  async function deleteChannel(addr: Address) {
    const channel = new PublicKey(addr)
    await client.deleteChannel({ channel })
    deleteChannelFromChannels(addr)
  }

  async function leaveChannel(channel: PublicKey) {
    console.log('leaveChannel channel === ', channel.toBase58())
    await client.leaveChannel({ channel })
    deleteChannelFromChannels(channel)
  }

  async function joinChannel(addr: Address, name: string) {
    const channel = new PublicKey(addr)
    try {
      await client.joinChannel({ channel, name })
      await loadChannel(addr)
      const joinedChannel = { pubkey: addr.toString(), status: 1 }
      state.ownChannels.push(joinedChannel)
    } catch (err) {
      console.log(err)
    }
  }

  async function loadChannel(addr: Address) {
    state.channelLoading = true
    state.channelMessages = state.channelMessages ?? []
    state.channelMembers = state.channelMembers ?? []
    state.channelMembershipAddr = undefined
    state.channelMembership = state.channelMembership ?? undefined
    state.channelAddr = new PublicKey(addr)
    state.memberDevices = []

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
      await loadMemberDevices()
      await loadChannelMembers()
      await loadChannelMessages()
    } catch (e) {
      console.log('Error', e)
    } finally {
      state.channelLoading = false
    }
  }

  async function getCEK(): Promise<Uint8Array | undefined> {
    if (!state.channelMembership || !deviceKey.value) {
      return
    }
    try {
      const [membershipAddr] = await client.getMembershipPDA(state.channelAddr as PublicKey)
      const [deviceAddr] = await client.getDevicePDA(membershipAddr, deviceKey.value.publicKey)
      const device = await client.loadDevice(deviceAddr)
      return await client.decryptCEK(device.cek, deviceKey.value.secretKey)
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
        const senderDisplayName = shortenAddress(m.sender)
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
    })
  }

  async function deleteMember(addr: Address) {
    if (!state.channelAddr) {
      console.log('Invalid channel')
      return
    }
    await client.deleteMember({
      channel: state.channelAddr,
      authority: new PublicKey(addr),
    })
  }

  async function addDevice(key: string) {
    if (!state.channelAddr) {
      console.log('Invalid channel')
      return
    }
    await client.addDevice({
      channel: state.channelAddr,
      key: new PublicKey(key),
    })
    await loadMemberDevices()
  }

  async function deleteDevice(key: PublicKey) {
    if (!state.channelAddr) {
      console.log('Invalid channel')
      return
    }
    await client.deleteDevice({
      channel: state.channelAddr,
      key,
    })
    await loadMemberDevices()
  }

  async function loadPendingDevices(authority: PublicKey) {
    return (await client.loadDevices(state.channelAddr as PublicKey, authority)).filter(acc => acc.data.cek?.encryptedKey === '')[0]
  }

  async function loadMemberDevices() {
    if (state.channelAddr && state.channelMembership) {
      state.memberDevices = await client.loadDevices(state.channelAddr, state.channelMembership.authority)
    }
  }

  async function authorizeMember(authority: PublicKey) {
    if (!state.channelAddr) {
      console.log('Invalid channel')
      return
    }
    const device = await loadPendingDevices(authority)
    await client.authorizeMember({
      channel: state.channelAddr,
      authority,
      key: device.data.key,
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

  function deleteChannelFromChannels(addr: PublicKey | string) {
    const channelIdx = state.allChannels.findIndex(ch => ch.pubkey.toBase58() === addr.toString())
    state.allChannels.splice(channelIdx, 1)
    state.channelMessages = []
    state.channel = undefined
  }

  async function channelMessagesCost(messages: number) {
    const channelSpace = client.channelSpace(messages)
    const channelMembershipSpace = client.channelMembershipSpace()
    const channelDeviceSpace = client.channelDeviceSpace()
    const rent = await connectionStore.connection.getMinimumBalanceForRentExemption(
      channelSpace + channelMembershipSpace + channelDeviceSpace,
    )
    // empty accounts cost in lamports
    const extra = 890880 * 2
    return (rent + extra) / LAMPORTS_PER_SOL
  }

  async function channelAuthorityDevice() {
    if (!state.channelAddr) {
      return
    }
    const [authorityMembership] = await client.getMembershipPDA(state.channelAddr)
    const [authorityDevice] = await client.getDevicePDA(authorityMembership)
    return (await client.loadDevice(authorityDevice)).key.toBase58()
  }

  return {
    channelMessagesCost,
    addDevice,
    deleteDevice,
    channelAuthorityDevice,
    state,
    client,
    leaveChannel,
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

export interface ChannelDevices {
  data: ChannelDevice
  pubkey: PublicKey
}
