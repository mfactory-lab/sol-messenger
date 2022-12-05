import { defineStore } from 'pinia'
import { useAnchorWallet } from 'solana-wallets-vue'
import { useMessengerStore } from '@/store/messenger'

export const useChannelStore = defineStore('channel', () => {
  const wallet = useAnchorWallet()
  const { state, client } = useMessengerStore()

  const isChannelLoading = computed(() => state.channelLoading)
  const isSendMessage = computed(() => state.sending)
  const isWalletConnected = computed(() => !!wallet.value?.publicKey)
  const isPublicChannel = computed(() => !!state.channel && client.utils.channel.isPublic(state.channel))
  const isPermissionlessChannel = computed(() => !!state.channel && client.utils.channel.isPermissionless(state.channel))
  const isAuthorizedMember = computed(() => state.channelMembership?.status === 0)
  const isPendingMember = computed(() => state.channelMembership?.status === 1)
  const isChannelCreator = computed(() => String(state.channel?.creator) === String(wallet.value?.publicKey ?? '-'))
  const canAddMember = computed(() => !!state.channelMembership && client.utils.member.canAddMember(state.channelMembership))
  const canAuthorizeMember = computed(() => !!state.channelMembership && client.utils.member.canAuthorizeMember(state.channelMembership))
  const canDeleteMember = computed(() => !!state.channelMembership && client.utils.member.canDeleteMember(state.channelMembership))
  const isAdmin = computed(() => !!state.channelMembership && client.utils.member.isAdmin(state.channelMembership))
  const isOwner = computed(() => !!state.channelMembership && client.utils.member.isOwner(state.channelMembership))
  const canJoinChannel = computed(() => isWalletConnected.value && !!state.channel
    && !state.loading && !isAuthorizedMember.value)
  const canCreateChannel = computed(() => isWalletConnected.value)
  const canDeleteChannel = computed(() => isOwner.value)
  const canGrantAccess = computed(() => isOwner.value)
  const canPostMessage = computed(() => !state.sending && (isPublicChannel.value || isAuthorizedMember.value))
  const ownChannels = computed(() =>
    state.allChannels.filter(
      ch =>
        !!state.ownChannels.find(
          myCh => myCh.pubkey === ch.pubkey.toBase58(),
        )
      || ch.data.flags === 1
      || ch.data.creator.toBase58() === String(wallet.value?.publicKey),
    ),
  )

  return {
    ownChannels,
    isChannelLoading,
    isSendMessage,
    isPublicChannel,
    isWalletConnected,
    isPermissionlessChannel,
    isAuthorizedMember,
    isPendingMember,
    isChannelCreator,
    isAdmin,
    isOwner,
    canJoinChannel,
    canAddMember,
    canAuthorizeMember,
    canDeleteMember,
    canCreateChannel,
    canDeleteChannel,
    canGrantAccess,
    canPostMessage,
  }
})
