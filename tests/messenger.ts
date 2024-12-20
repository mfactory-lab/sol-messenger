import * as assert from 'node:assert'
import { web3 } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { ChannelMembershipStatus, MessengerClient } from '../packages/sdk'
import adminKeypair from '../.secrets/admin.json'
import { initProvider, requestAirdrop } from './utils'

// TODO: super admin tests

describe('messenger', () => {
  const admin = Keypair.fromSecretKey(Uint8Array.from(adminKeypair))
  const sender = web3.Keypair.generate()

  const client = getClient(sender)
  const member1 = web3.Keypair.generate()
  const member2 = web3.Keypair.generate()
  const member3 = web3.Keypair.generate()

  function getClient(wallet: web3.Keypair, sender?: web3.Keypair) {
    return new MessengerClient(initProvider(wallet), sender ?? wallet)
  }

  before(async () => {
    console.log('Airdropping some lamports...')
    for (const { publicKey } of [admin, sender, member1, member2, member3]) {
      await requestAirdrop(client.connection, publicKey, 10)
    }
    console.log('Done')
  })

  console.log(`Program ID: ${client.programId}`)
  console.log(`Sender: ${sender.publicKey}`)

  describe('public', () => {
    let channel: PublicKey

    it('can init a public channel', async () => {
      const data = { name: 'General', public: true, maxMessages: 100 }
      const { channel: _channel } = await client.initChannel(data)
      channel = _channel.publicKey

      const msgData = { channel, message: 'test123' }
      await client.postMessage(msgData)

      const channelInfo = await client.loadChannel(channel)
      assert.equal(channelInfo.name, data.name)
      assert.ok(client.utils.channel.isPublic(channelInfo))

      const msg = channelInfo.messages[0]
      assert.equal(msg.content, msgData.message)
      assert.ok(!client.utils.message.isEncrypted(msg))
    })

    it('can any user send a message', async () => {
      const data = { channel, message: 'i am groot' }
      await getClient(member2).postMessage(data)

      const channelInfo = await client.loadChannel(channel)
      const msg = channelInfo.messages[1]

      assert.equal(msg.content, data.message)
      assert.ok(!client.utils.message.isEncrypted(msg))
    })
  })

  describe('private', () => {
    let channel: Keypair

    it('can init a private channel', async () => {
      const data = { name: 'test', memberName: 'creator', maxMessages: 100, permissionless: true }
      const { cekEncrypted, channel: _channel } = await client.initChannel(data)
      channel = _channel
      const channelInfo = await client.loadChannel(channel.publicKey)

      assert.equal(channelInfo.name, data.name)
      assert.equal(channelInfo.maxMessages, data.maxMessages)
      assert.deepEqual(channelInfo.creator, sender.publicKey)

      const [membershipAddr] = client.getMembershipPDA(channel.publicKey)

      const membership = await client.loadMembership(membershipAddr)
      assert.deepEqual(membership.channel, channel.publicKey)
      assert.deepEqual(membership.authority, sender.publicKey)
      assert.equal(membership.name, data.memberName)

      const device = await client.loadDevice((client.getDevicePDA(membershipAddr))[0])
      assert.deepEqual(device.key, sender.publicKey)
      assert.equal(device.cek.encryptedKey, cekEncrypted.encryptedKey)
    })

    it('can init channel with keypair', async () => {
      const data = { name: 'test2', maxMessages: 10 }
      const keypair = Keypair.generate()
      const { channel: newChannel } = await getClient(sender, keypair).initChannel(data)
      const channelInfo = await client.loadChannel(newChannel.publicKey)
      assert.equal(channelInfo.name, data.name)
      assert.equal(channelInfo.maxMessages, data.maxMessages)
    })

    it('can init channel with meta', async () => {
      const data = { name: 'test2', maxMessages: 10, meta: [{ key: 1, value: 'test' }] }
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
      } catch (e: any) {
        assert.ok(e.message.includes('custom program error: 0x0'))
      }
    })

    it('can add new meta', async () => {
      const data = { channel: channel.publicKey, key: 1, value: 'test123' }
      await client.addMeta(data)

      const [metaAddr] = client.getMetaPDA(channel.publicKey, data.key)
      const meta = await client.loadMeta(metaAddr)
      assert.deepEqual(meta.authority, sender.publicKey)
      assert.deepEqual(meta.channel, channel.publicKey)
      assert.deepEqual(meta.key, data.key)
      assert.equal(new TextDecoder().decode(meta.value), data.value)
    })

    it('can delete a meta', async () => {
      const data = { channel: channel.publicKey, key: 1 }
      await client.deleteMeta(data)
      const [metaAddr] = client.getMetaPDA(channel.publicKey, data.key)
      try {
        await client.loadMeta(metaAddr)
      } catch (e: any) {
        assert.ok(e.message.startsWith('Unable to find ChannelMeta account'))
      }
    })

    it('can add new device', async () => {
      const kp = Keypair.generate()
      await client.addDevice({ channel: channel.publicKey, key: kp.publicKey })

      const [membershipAddr] = client.getMembershipPDA(channel.publicKey)
      const [deviceAddr] = client.getDevicePDA(membershipAddr, kp.publicKey)
      const device = await client.loadDevice(deviceAddr)
      assert.deepEqual(device.authority, sender.publicKey)
      assert.deepEqual(device.channel, channel.publicKey)
      assert.deepEqual(device.key, kp.publicKey)

      const cek = await client.decryptCEK(device.cek, kp.secretKey)
      assert.ok(cek.length > 0)
    })

    it('can post encrypted message', async () => {
      const message = 'hello world'
      await client.postMessage({ channel: channel.publicKey, message, encrypt: true })

      const [membershipAddr] = client.getMembershipPDA(channel.publicKey)
      const [deviceAddr] = client.getDevicePDA(membershipAddr)
      const device = await client.loadDevice(deviceAddr)

      const cek = await client.decryptCEK(device.cek)
      const channelInfo = await client.loadChannel(channel.publicKey)
      const msg = channelInfo.messages[0]

      assert.equal(await client.decryptMessage(msg.content, cek), message)
      assert.equal(channelInfo.messageCount, 1)
      assert.equal(msg.flags, 1)
      assert.equal(msg.id, 1)
    })

    it('can update a message', async () => {
      const messageId = 1
      const newMessage = 'hello world v2'
      await client.updateMessage({ channel: channel.publicKey, messageId, newMessage, encrypt: true })

      const [membershipAddr] = client.getMembershipPDA(channel.publicKey)
      const [deviceAddr] = client.getDevicePDA(membershipAddr)
      const device = await client.loadDevice(deviceAddr)

      const cek = await client.decryptCEK(device.cek)
      const channelInfo = await client.loadChannel(channel.publicKey)
      const msg = channelInfo.messages[0]

      assert.equal(await client.decryptMessage(msg.content, cek), newMessage)
      assert.equal(msg.flags, 1)
      assert.equal(msg.id, 1)
    })

    it('can add member to the channel', async () => {
      const data = { channel: channel.publicKey, invitee: member1.publicKey, key: undefined, name: 'Alice' }
      await client.addMember(data)

      const channelInfo = await client.loadChannel(channel.publicKey)
      assert.equal(channelInfo.memberCount, 2)

      const [membershipAddr] = client.getMembershipPDA(channel.publicKey, member1.publicKey)
      const [deviceAddr] = client.getDevicePDA(membershipAddr, member1.publicKey)
      const membership = await client.loadMembership(membershipAddr)
      const device = await client.loadDevice(deviceAddr)

      assert.equal(membership.name, data.name)
      assert.deepEqual(membership.authority, data.invitee)
      assert.deepEqual(device.key, data.key ?? data.invitee)
    })

    it('can post encrypted message from invitee', async () => {
      const data = { channel: channel.publicKey, message: 'hello from invitee', encrypt: true }
      await getClient(member1).postMessage(data)
      const channelInfo = await client.loadChannel(channel.publicKey)
      assert.equal(channelInfo.messageCount, 2)
      assert.equal(channelInfo.messages[1].id, 2)
    })

    it('can read message from inviter', async () => {
      const channelInfo = await client.loadChannel(channel.publicKey)
      const [membershipAddr] = client.getMembershipPDA(channel.publicKey)
      const [deviceAddr] = client.getDevicePDA(membershipAddr)
      const device = await client.loadDevice(deviceAddr)
      const cek = await client.decryptCEK(device.cek, sender.secretKey)
      const message = await client.decryptMessage(channelInfo.messages[1].content, cek)
      assert.equal(message, 'hello from invitee')
    })

    it('cannot update another message', async () => {
      const data = { channel: channel.publicKey, messageId: 2, newMessage: 'test', encrypt: true }
      try {
        await client.updateMessage(data)
      } catch (e: any) {
        assert.ok(String(e).includes('0x1770')) // Unauthorized
      }
    })

    it('cannot delete another message', async () => {
      const data = { channel: channel.publicKey, messageId: 2 }
      try {
        await client.deleteMessage(data)
      } catch (e: any) {
        assert.ok(String(e).includes('0x1770')) // Unauthorized
      }
    })

    it('can member #2 join channel', async () => {
      const data = { channel: channel.publicKey, name: 'Alex', authority: undefined }
      await getClient(member2).joinChannel(data)
      const channelInfo = await client.loadChannel(channel.publicKey)
      assert.equal(channelInfo.memberCount, 3)

      const [membershipAddr] = client.getMembershipPDA(channel.publicKey, member2.publicKey)
      const membership = await client.loadMembership(membershipAddr)

      const [deviceAddr] = client.getDevicePDA(membershipAddr, member2.publicKey)
      const device = await client.loadDevice(deviceAddr)

      assert.deepEqual(membership.authority, member2.publicKey)
      assert.equal(membership.name, 'Alex')
      assert.deepEqual(device.cek, { encryptedKey: '', header: '' })
      assert.equal(membership.status, ChannelMembershipStatus.Pending)
    })

    it('cannot post message if not authorized', async () => {
      const data = { channel: channel.publicKey, message: 'test', encrypt: true }
      try {
        await getClient(member2).postMessage(data)
      } catch (e: any) {
        assert.equal(e.name, 'Unauthorized')
      }
    })

    it('can member #3 join the channel and await authorization only from member #2', async () => {
      const data = { channel: channel.publicKey, name: 'John', authority: member2.publicKey }
      await getClient(member3).joinChannel(data)
      const channelInfo = await client.loadChannel(channel.publicKey)
      assert.equal(channelInfo.memberCount, 4)

      const [membershipAddr] = client.getMembershipPDA(channel.publicKey, member3.publicKey)
      const membership = await client.loadMembership(membershipAddr)

      // const [deviceAddr] = await client.getDevicePDA(membershipAddr, member3.publicKey)
      // const device = await client.loadDevice(deviceAddr)

      assert.equal(membership.status, ChannelMembershipStatus.Pending)
      if (membership.status !== ChannelMembershipStatus.Authorized) {
        assert.equal(membership.statusTarget, member2.publicKey.toString())
      }
    })

    it('cannot authorize new member if not authorized membership', async () => {
      const data = { channel: channel.publicKey, authority: member3.publicKey }
      try {
        await getClient(member2).authorizeMember(data)
      } catch (e: any) {
        assert.equal(e.name, 'Unauthorized')
      }
    })

    it('cannot add new member if not authorized', async () => {
      const data = { channel: channel.publicKey, invitee: member3.publicKey, key: undefined, name: 'John' }
      try {
        await getClient(member2).addMember(data)
      } catch (e: any) {
        assert.equal(e.name, 'Unauthorized')
      }
    })

    it('can member #1 authorize member #2', async () => {
      const data = { channel: channel.publicKey, authority: member2.publicKey }
      await getClient(member1).authorizeMember(data)

      const [membershipAddr] = client.getMembershipPDA(channel.publicKey, member2.publicKey)
      const membership = await client.loadMembership(membershipAddr)

      assert.equal(membership.status, ChannelMembershipStatus.Authorized)
    })

    it('cannot member #1 authorize a member #3', async () => {
      const data = { channel: channel.publicKey, authority: member3.publicKey }
      try {
        await getClient(member1).authorizeMember(data)
        assert.ok(false)
      } catch (e: any) {
        assert.equal(e?.name, 'Unauthorized')
      }
    })

    it('can member #2 leave the channel', async () => {
      const data = { channel: channel.publicKey }
      await getClient(member2).leaveChannel(data)
      try {
        const [membershipAddr] = client.getMembershipPDA(channel.publicKey, member2.publicKey)
        await client.loadMembership(membershipAddr)
      } catch (e: any) {
        assert.ok(e.message.startsWith('Unable to find ChannelMembership account'))
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
        await getClient(member1).deleteChannel({
          channel: channel.publicKey,
        })
        assert.ok(false)
      } catch (e: any) {
        assert.equal(e.name, 'Unauthorized')
      }
    })

    it('can creator delete a channel', async () => {
      try {
        await client.deleteChannel({
          channel: channel.publicKey,
        })
        await client.loadChannel(channel.publicKey)
      } catch (e: any) {
        assert.ok(e.message.startsWith('Unable to find Channel account'))
      }
    })
  })

  describe('admin', () => {
    it('can admin delete a device', async () => {
      const channels = await client.loadAllChannels()
      const devices = await client.loadDevices(channels[0].pubkey)
      const device = devices[0]
      await getClient(admin).deleteDevice({
        channel: device.data.channel,
        authority: device.data.authority,
        key: device.data.key,
      })
    })

    it('can admin delete a member', async () => {
      const channels = await client.loadAllChannels()
      const members = await client.loadChannelMembers(channels[0].pubkey)
      const member = members[0]
      await getClient(admin).deleteMember({ channel: member.data.channel, authority: member.data.authority })
    })

    it('can admin delete a channel', async () => {
      const channels = await client.loadAllChannels()
      await getClient(admin).deleteChannel({ channel: channels[0].pubkey })
    })
  })
})
