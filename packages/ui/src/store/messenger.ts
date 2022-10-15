import type { Channel } from '@app/sdk'
import { MessengerClient } from '@app/sdk'
import type { Address } from '@project-serum/anchor'
import { AnchorProvider } from '@project-serum/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { defineStore } from 'pinia'
import { useAnchorWallet } from 'solana-wallets-vue'

interface MessengerStoreState {
  channelKey?: PublicKey
  channelData?: Channel
  channelMembers: any[]
  loading: boolean
  sending: boolean
}

export const useMessengerStore = defineStore('messenger', () => {
  const connectionStore = useConnectionStore()
  const wallet = useAnchorWallet()

  const keypair = Keypair.generate()

  const state = reactive<MessengerStoreState>({
    channelKey: undefined,
    channelData: undefined,
    channelMembers: [],
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

  client.loadChannels().then((res) => {
    console.log(res)
  })

  async function loadChannel(addr: Address) {
    try {
      state.loading = true
      state.channelKey = new PublicKey(addr)
      state.channelData = await client.loadChannel(state.channelKey)

      // TODO: decode all messages

      state.channelMembers = await client.loadChannelMembers(state.channelKey)
    } finally {
      state.loading = false
    }
  }

  async function postMessage(message: string) {
    if (!state.channelKey) {
      console.log('Empty channel')
      return
    }
    try {
      state.sending = true
      await client.postMessage({
        channel: state.channelKey,
        message,
        // sender,
      })
    } finally {
      state.sending = false
    }
  }

  async function addMember(addr: Address) {
    if (!state.channelKey) {
      console.log('Empty channel')
      return
    }
    await client.addToChannel({
      channel: state.channelKey,
      invitee: new PublicKey(addr),
    })
  }

  return {
    state,
    client,
    keypair,
    loadChannel,
    postMessage,
    addMember,
  }
})
