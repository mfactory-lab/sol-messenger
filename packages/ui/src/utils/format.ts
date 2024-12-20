import type { ChannelMembership } from '@cgram/sdk'
import { shortenAddress } from './web3'

export function formatMemberName(member: ChannelMembership) {
  if (member?.name && member.name !== '') {
    return member.name
  }
  return shortenAddress(member.authority)
}
