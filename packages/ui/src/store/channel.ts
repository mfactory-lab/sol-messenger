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
  const isAuthorizedMember = computed(() => state.channelMembership?.status.__kind === 'Authorized')
  const isPendingMember = computed(() => state.channelMembership?.status.__kind === 'Pending')
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
  const canPostMessage = computed(() => !state.sending && (isPublicChannel.value || isAuthorizedMember.value))

  return {
    isChannelLoading,
    isSendMessage,
    isPublicChannel,
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
    canPostMessage,
  }
})
