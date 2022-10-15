import type { Channel, ChannelMembership, Message } from '@app/sdk'
import { MessengerClient } from '@app/sdk'
import type { Address } from '@project-serum/anchor'
import { AnchorProvider } from '@project-serum/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { defineStore } from 'pinia'
import { useAnchorWallet } from 'solana-wallets-vue'

interface MessengerStoreState {
  allChannels: { pubkey: PublicKey; account: Channel }[]
  channel?: Channel
  channelAddr?: PublicKey
  channelMembership?: ChannelMembership
  channelMembers: any[]
  channelMessages: Message[]
  loading: boolean
  sending: boolean
}

export const useMessengerStore = defineStore('messenger', () => {
  const connectionStore = useConnectionStore()
  const wallet = useAnchorWallet()

  // TODO: localStore, etc...
  const keypair = Keypair.generate()

  const state = reactive<MessengerStoreState>({
    allChannels: [],
    channel: undefined,
    channelAddr: undefined,
    channelMembership: undefined,
    channelMembers: [],
    // decrypted messages list
    channelMessages: [],
    loading: false,
    sending: false,
  })

  const client = $computed(() => {
    return new MessengerClient(
      new AnchorProvider(
        connectionStore.connection,
        wallet.value ?? { publicKey: PublicKey.default } as never,
        AnchorProvider.defaultOptions(),
      ), keypair)
  })

  client.loadAllChannels().then((res) => {
    console.log('All channels', res)
    state.allChannels = res as any
  })

  async function createChannel(name: string, maxMessages = 15) {
    try {
      state.loading = true
      const { channel } = await client.initChannel({
        name,
        maxMessages,
      })
      await loadChannel(channel.publicKey)
    } finally {
      state.loading = false
    }
  }

  async function loadChannel(addr: Address) {
    state.loading = true
    state.channelAddr = new PublicKey(addr)
    const [membershipAddr] = await client.getMembershipPDA(state.channelAddr)
    try {
      state.channelMembership = await client.loadMembership(membershipAddr)
      await Promise.all([
        loadChannelMembers(),
        reloadChannel(),
      ])
    } catch (e) {
      console.log(e)
    } finally {
      state.loading = false
    }
  }

  async function reloadChannel() {
    if (!state.channelAddr) {
      console.warn('Invalid channel')
      return
    }
    if (!state.channelMembership) {
      console.warn('Invalid membership')
      return
    }
    state.channel = await client.loadChannel(state.channelAddr)
    const cek = await client.decryptCEK(state.channelMembership.cek)
    state.channelMessages = await Promise.all(
      state.channel.messages.map(async (m) => {
        let content = '***** *** *** *** *******'
        try {
          content = await client.decryptMessage(m.content, cek)
        } catch (e) {
          console.log(`Failed to decrypt message #${m.id}`)
        }
        return { ...m, content }
      }),
    )
  }

  async function loadChannelMembers() {
    if (!state.channelAddr) {
      console.warn('Invalid channel')
      return
    }
    state.channelMembers = await client.loadChannelMembers(state.channelAddr)
  }

  async function postMessage(message: string) {
    if (!state.channelAddr) {
      console.warn('Please select a channel')
      return
    }
    try {
      state.sending = true
      await client.postMessage({ channel: state.channelAddr, message })
      await reloadChannel()
    } finally {
      state.sending = false
    }
  }

  async function addMember(addr: Address, key?: PublicKey, name?: string) {
    if (!state.channelAddr) {
      console.log('Invalid channel')
      return
    }
    await client.addMember({
      channel: state.channelAddr,
      invitee: new PublicKey(addr),
      key,
      name,
    })
  }

  return {
    state,
    client,
    keypair,
    createChannel,
    loadChannel,
    postMessage,
    addMember,
  }
})
