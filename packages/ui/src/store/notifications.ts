import { defineStore } from 'pinia'
import { useAnchorWallet } from 'solana-wallets-vue'
import type { AllChannels } from './messenger'

export const useNotificationsStore = defineStore('notifications', () => {
  const wallet = useAnchorWallet()

  const { loadMembers, state: messengerStore } = useMessengerStore()
  const channel = useChannelStore()

  const state = reactive({
    showInfo: false,
    showDialog: false,
    pendingChannels: [],
  })

  watch(
    [() => channel.ownChannels,
      () => messengerStore.channelMembers],
    async (p, n) => {
      if (n.length > 0) {
        await loadMemberships(n[0])
      }
    },
  )

  async function loadMemberships(ch: AllChannels[]) {
    try {
      const res = await Promise.all(
        ch.map(async (ch: any) => {
          const { pubkey, data } = ch
          if (
            data.creator.toBase58() === wallet.value?.publicKey.toBase58()
          ) {
            const members = await loadMembers(pubkey)

            if (members.length === 0) {
              return
            }
            const pendingMembers = members.filter(m => m.data.status === 1)
            return pendingMembers.length
              ? {
                  channel: ch,
                  pendingMembers,
                }
              : undefined
          }
        }),
      )
      state.pendingChannels = res.filter(c => c) as any

      if (state.pendingChannels.length > 0) {
        /**
             * show details animation
             */
        setTimeout(() => (state.showInfo = true), 2000)
        setTimeout(() => (state.showInfo = false), 7000)
      } else {
        state.showDialog = false
      }
    } catch (e) {
      console.log(e)
    }
  }
  return {
    state,
  }
})
