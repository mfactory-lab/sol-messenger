import * as assert from 'assert'
import type { ConfirmOptions, Keypair } from '@solana/web3.js'
import { AnchorProvider, Wallet, web3 } from '@project-serum/anchor'
import { MessengerClient } from '../packages/sdk'

describe('messenger', () => {
  const sender = web3.Keypair.generate()

  const opts: ConfirmOptions = AnchorProvider.defaultOptions()
  const provider = new AnchorProvider(
    new web3.Connection('http://localhost:8899', opts),
    new Wallet(sender),
    opts,
  )

  const client = new MessengerClient(provider, sender)

  before(async () => {
    console.log('Airdrop some lamports first...')
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        provider.wallet.publicKey,
        web3.LAMPORTS_PER_SOL * 10,
      ),
      'confirmed',
    )
  })

  let channel: Keypair
  const invitee = web3.Keypair.generate()

  console.log(`Program ID: ${client.programId}`)
  console.log(`Sender: ${sender.publicKey}`)

  it('init channel', async () => {
    const data = { name: 'test', maxMessages: 10 }
    const { cekEncrypted, channel: _channel } = await client.initChannel(data)
    channel = _channel
    const channelInfo = await client.loadChannel(channel.publicKey)
    const acaInfo = await client.loadAca((await client.getAca(channel.publicKey))[0])
    assert.equal(channelInfo.name, data.name)
    assert.equal(channelInfo.maxMessages, data.maxMessages)
    assert.equal(channelInfo.authority.toBase58(), sender.publicKey.toBase58())
    assert.equal(acaInfo.channel.toBase58(), channel.publicKey.toBase58())
    assert.equal(acaInfo.owner.toBase58(), sender.publicKey.toBase58())
    assert.equal(acaInfo.cek.encryptedKey, cekEncrypted.encryptedKey)
  })

  it('post message', async () => {
    const message = 'hello world'
    await client.postMessage({ channel: channel.publicKey, message })
    const aca = await client.loadAca((await client.getAca(channel.publicKey))[0])
    const cek = await client.decryptCEK(aca.cek)
    const channelInfo = await client.loadChannel(channel.publicKey)
    assert.equal(await client.decryptMessage(channelInfo.messages[0].content, cek), message)
  })

  it('add to channel', async () => {
    await client.addToChannel({ channel: channel.publicKey, invitee: invitee.publicKey })
    const channelInfo = await client.loadChannel(channel.publicKey)
    assert.equal(channelInfo.memberCount, 2)
  })

  it('post message from invitee', async () => {
    const message = 'hello from invitee'
    await client.postMessage({ channel: channel.publicKey, message, sender: invitee })
    const channelInfo = await client.loadChannel(channel.publicKey)
    assert.equal((channelInfo.messages as Array<any>).length, 2)
  })

  it('read message from inviter', async () => {
    const channelInfo = await client.loadChannel(channel.publicKey)
    const aca = await client.loadAca((await client.getAca(channel.publicKey))[0])
    const cek = await client.decryptCEK(aca.cek, sender.secretKey)
    const message = await client.decryptMessage(channelInfo.messages[1].content, cek)
    assert.equal(message, 'hello from invitee')
  })
})
