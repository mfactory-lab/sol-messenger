import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '../context'

export async function init(opts: any) {
  const { client } = useContext()
  const channel = await client.initChannel({
    name: opts.name,
    memberName: opts.memberName,
    maxMessages: opts.maxMessages ?? 15,
  })
  log.info(JSON.stringify(channel, null, 2))
  log.info('Done')
}

export async function show(addr: string, _opts: any) {
  const { client } = useContext()
  const channel = await client.loadChannel(new PublicKey(addr))
  log.info(JSON.stringify(channel, null, 2))
}

export async function all(_opts: any) {
  const { client } = useContext()
  const channels = await client.loadAllChannels()
  log.info(`Found  ${channels.length} channels`)
  log.info(JSON.stringify(channels, null, 2))
}

export async function deleteChannel(key: string, _opts: any) {
  const { client } = useContext()

  const channelKey = new PublicKey(key)

  log.info('Deleting members...')
  const members = await client.loadChannelMembers(channelKey)
  log.info(`Found ${members.length} members`)
  for (const member of members) {
    log.info('Deleting member...')
    const { signature } = await client.deleteMember({
      channel: channelKey,
      authority: member.data.authority,
    })
    log.info(`Sig: ${signature}`)
  }

  log.info('Deleting channel...')
  const { signature } = await client.deleteChannel({ channel: channelKey })
  log.info(`Sig: ${signature}`)
  log.info('Done')
}

export async function deleteAllChannels(_opts: any) {
  const { client } = useContext()

  const channels = await client.loadAllChannels()
  log.info(`Found  ${channels.length} channels`)

  for (const channel of channels) {
    const members = await client.loadChannelMembers(channel.pubkey)
    log.info(`Found ${members.length} members`)
    for (const member of members) {
      log.info('Deleting member...')
      const { signature } = await client.deleteMember({
        channel: channel.pubkey,
        authority: member.data.authority,
      })
      log.info(`Sig: ${signature}`)
    }
    log.info(`Deleting channel ${channel.pubkey}`)
    const { signature } = await client.deleteChannel({
      channel: channel.pubkey,
    })
    log.info(`Sig: ${signature}`)
  }

  log.info('Done')
}

export async function deleteChannelMember(channelAddr: string, authority: string, _opts: any) {
  const { client } = useContext()
  const { signature } = await client.deleteMember({
    channel: new PublicKey(channelAddr),
    authority: new PublicKey(authority),
  })
  log.info(`Sig: ${signature}`)

  log.info('Done')
}
