import * as assert from 'assert'
import { Keypair } from '@solana/web3.js'
import type { ConfirmOptions } from '@solana/web3.js'
import { AnchorProvider, Wallet, web3 } from '@project-serum/anchor'
import { MessengerClient } from '../packages/sdk'

describe('messenger', () => {
  const sender = web3.Keypair.generate()

  function getClient(wallet: web3.Keypair, sender?: web3.Keypair) {
    const opts: ConfirmOptions = AnchorProvider.defaultOptions()
    const provider = new AnchorProvider(
      new web3.Connection('http://localhost:8899', opts),
      new Wallet(wallet),
      opts,
    )
    return new MessengerClient(provider, sender ?? wallet)
  }

  const client = getClient(sender)

  let channel: Keypair
  const member1 = web3.Keypair.generate()
  const member2 = web3.Keypair.generate()
  const member3 = web3.Keypair.generate()

  before(async () => {
    console.log('Airdropping some lamports...')
    for (const { publicKey } of [sender, member1, member2, member3]) {
      await client.connection.confirmTransaction(
        await client.connection.requestAirdrop(publicKey, web3.LAMPORTS_PER_SOL),
      )
    }
  })

  console.log(`Program ID: ${client.programId}`)
  console.log(`Sender: ${sender.publicKey}`)

  it('can init channel', async () => {
    const data = { name: 'test', memberName: 'creator', maxMessages: 10 }
    const { cekEncrypted, channel: _channel } = await client.initChannel(data)
    channel = _channel
    const channelInfo = await client.loadChannel(channel.publicKey)
    const membership = await client.loadMembership((await client.getMembershipPDA(channel.publicKey))[0])
    assert.equal(channelInfo.name, data.name)
    assert.equal(channelInfo.maxMessages, data.maxMessages)
    assert.equal(channelInfo.creator.toBase58(), sender.publicKey.toBase58())
    assert.equal(membership.channel.toBase58(), channel.publicKey.toBase58())
    assert.equal(membership.authority.toBase58(), sender.publicKey.toBase58())
    assert.equal(membership.key.toBase58(), sender.publicKey.toBase58())
    assert.equal(membership.name, data.memberName)
    assert.equal(membership.cek.encryptedKey, cekEncrypted.encryptedKey)
  })

  it('can init channel with keypair', async () => {
    const data = { name: 'test', maxMessages: 10 }
    const keypair = Keypair.generate()
    const { channel: newChannel } = await getClient(sender, keypair).initChannel(data)
    const channelInfo = await client.loadChannel(newChannel.publicKey)
    assert.equal(channelInfo.name, data.name)
    assert.equal(channelInfo.maxMessages, data.maxMessages)
  })

  it('cannot init channel with existing account', async () => {
    const data = { name: 'test', maxMessages: 10, channel }
    try {
      await client.initChannel(data)
      assert.ok(false)
    } catch (e) {
      assert.ok(e.message.includes('custom program error: 0x0'))
    }
  })

  it('can post message', async () => {
    const message = 'hello world'
    await client.postMessage({ channel: channel.publicKey, message })
    const aca = await client.loadMembership((await client.getMembershipPDA(channel.publicKey))[0])
    const cek = await client.decryptCEK(aca.cek)
    const channelInfo = await client.loadChannel(channel.publicKey)
    assert.equal(await client.decryptMessage(channelInfo.messages[0].content, cek), message)
    assert.equal(channelInfo.messageCount, 1)
    assert.equal(channelInfo.messages[0].id, 1)
  })

  it('can add member to the channel', async () => {
    const data = { channel: channel.publicKey, invitee: member1.publicKey, key: null, name: 'Alice' }
    await client.addMember(data)

    const channelInfo = await client.loadChannel(channel.publicKey)
    assert.equal(channelInfo.memberCount, 2)

    const [membershipAddr] = await client.getMembershipPDA(channel.publicKey, member1.publicKey)
    const membership = await client.loadMembership(membershipAddr)
    assert.deepEqual(membership.authority, data.invitee)
    assert.deepEqual(membership.key, data.key ?? data.invitee)
    assert.equal(membership.name, data.name)
  })

  it('can post message from invitee', async () => {
    const data = { channel: channel.publicKey, message: 'hello from invitee' }
    await getClient(member1).postMessage(data)
    const channelInfo = await client.loadChannel(channel.publicKey)
    assert.equal(channelInfo.messageCount, 2)
    assert.equal(channelInfo.messages[1].id, 2)
  })

  it('can read message from inviter', async () => {
    const channelInfo = await client.loadChannel(channel.publicKey)
    const aca = await client.loadMembership((await client.getMembershipPDA(channel.publicKey))[0])
    const cek = await client.decryptCEK(aca.cek, sender.secretKey)
    const message = await client.decryptMessage(channelInfo.messages[1].content, cek)
    assert.equal(message, 'hello from invitee')
  })

  it('can member #2 join channel', async () => {
    const data = { channel: channel.publicKey, name: 'Alex', authority: null }
    await getClient(member2).joinChannel(data)
    const channelInfo = await client.loadChannel(channel.publicKey)
    assert.equal(channelInfo.memberCount, 3)

    const [membershipAddr] = await client.getMembershipPDA(channel.publicKey, member2.publicKey)
    const membership = await client.loadMembership(membershipAddr)

    assert.deepEqual(membership.authority, member2.publicKey)
    assert.equal(membership.name, 'Alex')
    assert.deepEqual(membership.cek, { encryptedKey: '', header: '' })
    assert.equal(membership.status.__kind, 'Pending')
  })

  it('cannot post message if not authorized', async () => {
    const data = { channel: channel.publicKey, message: 'test' }
    try {
      await getClient(member2).postMessage(data)
    } catch (e) {
      assert.equal(e.name, 'Unauthorized')
    }
  })

  it('can member #3 join the channel and await authorization only from member #2', async () => {
    const data = { channel: channel.publicKey, name: 'John', authority: member2.publicKey }
    await getClient(member3).joinChannel(data)
    const channelInfo = await client.loadChannel(channel.publicKey)
    assert.equal(channelInfo.memberCount, 4)

    const [membershipAddr] = await client.getMembershipPDA(channel.publicKey, member3.publicKey)
    const membership = await client.loadMembership(membershipAddr)
    assert.equal(membership.status.__kind, 'Pending')
    if (membership.status.__kind !== 'Authorized') {
      assert.equal(membership.status.authority.toString(), member2.publicKey.toString())
    }
  })

  it('cannot authorize new member if not authorized', async () => {
    const data = { channel: channel.publicKey, key: member3.publicKey }
    try {
      await getClient(member2).authorizeMember(data)
    } catch (e) {
      assert.equal(e.name, 'Unauthorized')
    }
  })

  it('cannot add new member if not authorized', async () => {
    const data = { channel: channel.publicKey, invitee: member3.publicKey, key: null, name: 'John' }
    try {
      await getClient(member2).addMember(data)
    } catch (e) {
      assert.equal(e.name, 'Unauthorized')
    }
  })

  it('can member #1 authorize member #2', async () => {
    const data = { channel: channel.publicKey, key: member2.publicKey }
    await getClient(member1).authorizeMember(data)

    const [membershipAddr] = await client.getMembershipPDA(channel.publicKey, member2.publicKey)
    const membership = await client.loadMembership(membershipAddr)
    assert.equal(membership.status.__kind, 'Authorized')
  })

  it('cannot member #1 authorize a member #3', async () => {
    const data = { channel: channel.publicKey, key: member3.publicKey }
    try {
      await getClient(member1).authorizeMember(data)
      assert.ok(false)
    } catch (e) {
      assert.equal(e?.name, 'Unauthorized')
    }
  })

  // it('can member #2 add new device', async () => {
  //   const data = { channel: channel.publicKey, key: member2.publicKey }
  //   await getClient(member2).addMember(data)
  //
  //   const [membershipAddr] = await client.getMembershipPDA(channel.publicKey, member2.publicKey)
  //   const membership = await client.loadMembership(membershipAddr)
  //   assert.equal(membership.status.__kind, 'Authorized')
  // })

  it('cannot member #1 delete a channel', async () => {
    try {
      await getClient(member1).deleteChannel(channel.publicKey)
      assert.ok(false)
    } catch (e) {
      assert.equal(e.name, 'Unauthorized')
    }
  })

  it('can delete a channel', async () => {
    try {
      await client.deleteChannel(channel.publicKey)
      await client.loadChannel(channel.publicKey)
    } catch (e) {
      assert.ok(e.message.startsWith('Unable to find Channel account'))
    }
  })
})
