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
  allChannels: { pubkey: PublicKey; data: Channel }[]
  channel?: Channel
  channelAddr?: PublicKey
  channelMembership?: ChannelMembership
  channelMembers: { pubkey: PublicKey; data: ChannelMembership }[]
  channelMessages: Array<Message & { sender: any }>
  channelLoading: boolean
  loading: boolean
  creating: boolean
  sending: boolean
}

export const useMessengerStore = defineStore('messenger', () => {
  const connectionStore = useConnectionStore()
  const userStore = useUserStore()
  const wallet = useAnchorWallet()

  // const secretKey = useLocalStorage('key', () => bs58.encode(Keypair.generate().secretKey))
  // const keypair = Keypair.fromSecretKey(bs58.decode(secretKey.value))

  const state = reactive<MessengerStoreState>({
    allChannels: [],
    channel: undefined,
    channelAddr: undefined,
    channelMembership: undefined,
    channelMembers: [],
    channelMessages: [], // decrypted messages list
    channelLoading: false,
    loading: false,
    creating: false,
    sending: false,
  })

  const client = $computed(() => {
    return new MessengerClient(
      new AnchorProvider(
        connectionStore.connection,
        wallet.value ?? { publicKey: PublicKey.default } as never,
        AnchorProvider.defaultOptions(),
      ), userStore.keypair as Keypair)
  })

  init().then()

  async function init() {
    state.loading = true
    const channels = await client.loadAllChannels()
    for (const channel of channels) {
      console.log(`Channel: ${channel.pubkey}`)
      console.log(channel.data.pretty())
      const members = await client.loadChannelMembers(channel.pubkey)
      console.log('|-- members:')
      for (const member of members) {
        console.log(`key: ${member.pubkey}`)
        console.log(JSON.stringify(member.data.pretty(), null, 2))
      }
    }

    watch(wallet, (w) => {
      if (w?.publicKey && state.channelAddr) {
        loadChannel(state.channelAddr)
      }
    })
    state.allChannels = channels as any
    state.loading = false
  }

  async function createChannel(name: string, maxMessages = 15) {
    try {
      state.creating = true
      const { channel } = await client.initChannel({
        name,
        maxMessages,
      })
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
    // const key = new PublicKey('2MF6T12ez4Wdzo9AggucE2659bGsrh6n39M8JR9afa6S')
    // const [membership] = await client.getMembershipPDA(channel, key)
    await client.deleteChannel(channel)
    await init()
  }

  async function joinChannel(addr: Address, name: string) {
    const channel = new PublicKey(addr)
    await client.joinChannel({ channel, name })
    await loadChannel(addr)
  }

  async function loadChannel(addr: Address) {
    state.channelLoading = true
    state.channelAddr = new PublicKey(addr)
    try {
      if (wallet.value?.publicKey) {
        try {
          const [membershipAddr] = await client.getMembershipPDA(state.channelAddr)
          state.channelMembership = await client.loadMembership(membershipAddr)
        } catch (e) {
          console.log(e)
          state.channelMembership = undefined
        }
      }
      await Promise.all([
        reloadChannel(),
        loadChannelMembers(),
      ])
    } catch (e) {
      console.log('Error', e)
    } finally {
      state.channelLoading = false
    }
  }

  async function reloadChannel() {
    if (!state.channelAddr) {
      console.log('Invalid channel')
      return
    }
    state.channel = await client.loadChannel(state.channelAddr)

    let cek: Uint8Array
    if (state.channelMembership) {
      try {
        cek = await client.decryptCEK(state.channelMembership.cek)
      } catch (e) {
        console.log(e)
      }
    }

    state.channelMessages = await Promise.all(
      state.channel.messages.map(async (m) => {
        let content = '***** *** *** *** *******'
        let sender = shortenAddress(m.sender)
        const membership = state.channelMembers.find(({ data }) =>
          String(data.authority) === String(m.sender)
          || String(data.key) === String(m.sender),
        )
        if (membership && membership.data.name !== '') {
          sender = membership.data.name
        }
        if (cek) {
          try {
            content = await client.decryptMessage(m.content, cek)
          } catch (e) {
            console.log(`Failed to decrypt message #${m.id}`)
          }
        }
        return { ...m, sender, content }
      }),
    )
  }

  async function loadChannelMembers() {
    if (!state.channelAddr) {
      console.error('Invalid channel')
      return
    }
    state.channelMembers = await client.loadChannelMembers(state.channelAddr)
  }

  async function postMessage(message: string) {
    if (!state.channelAddr) {
      console.log('Please select a channel')
      return
    }
    try {
      state.sending = true
      await client.postMessage({
        channel: state.channelAddr,
        message,
      })
      await reloadChannel()
    } finally {
      state.sending = false
    }
  }

  async function addMember(invitee: Address, key?: Address, name?: string) {
    if (!state.channelAddr) {
      console.log('Invalid channel')
      return
    }
    await client.addMember({
      channel: state.channelAddr,
      invitee: new PublicKey(invitee),
      key: key ? new PublicKey(key) : undefined,
      name,
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
    })
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
    await reloadChannel()
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
  }
})
