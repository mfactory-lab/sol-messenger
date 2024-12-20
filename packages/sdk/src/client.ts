import type { AnchorProvider } from '@coral-xyz/anchor'
import { BorshCoder, EventManager } from '@coral-xyz/anchor'
import type { Commitment, ConfirmOptions, Signer } from '@solana/web3.js'
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import idl from '../idl/messenger.json'
import type { CEKData, Message } from './generated'
import {
  Channel,
  ChannelDevice,
  ChannelMembership,
  ChannelMembershipStatus,
  ChannelMeta,
  PROGRAM_ID,
  channelDeviceDiscriminator,
  channelDiscriminator,
  channelMembershipDiscriminator,
  channelMetaDiscriminator,
  createAddDeviceInstruction,
  createAddMemberInstruction,
  createAddMetaInstruction,
  createAuthorizeMemberInstruction,
  createDeleteChannelInstruction,
  createDeleteDeviceInstruction,
  createDeleteMemberInstruction,
  createDeleteMessageInstruction,
  createDeleteMetaInstruction,
  createGrantAccessMemberInstruction,
  createInitChannelInstruction,
  createJoinChannelInstruction,
  createLeaveChannelInstruction,
  createPostMessageInstruction,
  createReadMessageInstruction,
  createUpdateMessageInstruction, errorFromCode, errorFromName,
} from './generated'
import type { CEK } from './utils'
import { decryptCEK, decryptMessage, encryptCEK, encryptMessage, generateCEK } from './utils'

export enum ChannelFlags {
  /// [Channel] messages is not encrypted and [ChannelMembership] is not required
  IsPublic = 0b001,
  /// Do not check channel permission when adding, deleting, authorizing a member
  Permissionless = 0b010,
}

export enum ChannelMembershipFlags {
  AddMember = 0b001,
  DeleteMember = 0b010,
  AuthorizeMember = 0b100,
  // eslint-disable-next-line ts/prefer-literal-enum-member
  Admin = AddMember | DeleteMember | AuthorizeMember,
  Owner = 0xFF,
}

export enum MessageFlags {
  isEncrypted = 0b001,
}

const constants = {
  maxWorkspaceLength: 32,
  maxChannelNameLength: 32,
  maxMemberNameLength: 32,
  maxMessageLength: 400,
  maxCEKLength: 100,
}

const META_SEED = 'meta'

export class MessengerClient {
  programId = PROGRAM_ID
  constants = constants

  _coder: BorshCoder
  _events: EventManager

  constructor(
    private readonly provider: AnchorProvider,
    private keypair?: Keypair,
    private workspace?: string,
  ) {
    this._coder = new BorshCoder(idl as any)
    this._events = new EventManager(this.programId, provider, this._coder)
  }

  get connection() {
    return this.provider.connection
  }

  utils = {
    channel: {
      isPublic: (c: Channel) => (c.flags & ChannelFlags.IsPublic) > 0,
      isPermissionless: (c: Channel) => (c.flags & ChannelFlags.Permissionless) > 0,
    },
    member: {
      isAuthorized: (m: ChannelMembership) => m.status === ChannelMembershipStatus.Authorized,
      isPending: (m: ChannelMembership) => m.status === ChannelMembershipStatus.Pending,
      isOwner: (m: ChannelMembership) => m.flags >= ChannelMembershipFlags.Owner,
      isAdmin: (m: ChannelMembership) => (m.flags & ChannelMembershipFlags.Admin) === ChannelMembershipFlags.Admin,
      canAddMember: (m: ChannelMembership) => (m.flags & ChannelMembershipFlags.AddMember) > 0,
      canDeleteMember: (m: ChannelMembership) => (m.flags & ChannelMembershipFlags.DeleteMember) > 0,
      canAuthorizeMember: (m: ChannelMembership) => (m.flags & ChannelMembershipFlags.AuthorizeMember) > 0,
    },
    message: {
      isEncrypted: (m: Message) => (m.flags & MessageFlags.isEncrypted) > 0,
    },
  }

  /**
   * Invokes the given callback every time the given event is emitted.
   *
   * @param eventName The PascalCase name of the event, provided by the IDL.
   * @param callback  The function to invoke whenever the event is emitted from
   *                  program logs.
   */
  public addEventListener(
    eventName: string,
    callback: (event: any, slot: number, signature: string) => void,
  ): number {
    return this._events.addEventListener(eventName, (event: any, slot: number, signature: string) => {
      // skip simulation signature
      if (signature !== '1111111111111111111111111111111111111111111111111111111111111111') {
        callback(event, slot, signature)
      }
    })
  }

  /**
   * Unsubscribes from the given eventName.
   */
  public async removeEventListener(listener: number): Promise<void> {
    return await this._events.removeEventListener(listener)
  }

  /**
   * Set new sender keypair
   */
  setKeypair(keypair: Keypair) {
    this.keypair = keypair
  }

  /**
   * Load all channels
   */
  async loadAllChannels(filter: { name?: string, creator?: string } = {}) {
    const builder = Channel.gpaBuilder()
      .addFilter('accountDiscriminator', channelDiscriminator)

    if (this.workspace !== undefined) {
      builder.addFilter('workspace', this.workspace)
    }

    if (filter.name) {
      builder.addFilter('name', filter.name)
    }

    if (filter.creator) {
      builder.addFilter('creator', filter.creator)
    }

    return (await builder.run(this.provider.connection)).map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: Channel.fromAccountInfo(acc.account)[0],
      }
    })
  }

  /**
   * Load channel by {@link addr}
   */
  async loadChannel(addr: PublicKey, commitment?: Commitment) {
    return Channel.fromAccountAddress(this.provider.connection, addr, commitment)
  }

  /**
   * Load list of {@link ChannelMembership} for the {@link channel}
   */
  async loadChannelMembers(channel: PublicKey) {
    const accounts = await ChannelMembership.gpaBuilder()
      .addFilter('accountDiscriminator', channelMembershipDiscriminator)
      .addFilter('channel', channel)
      .run(this.provider.connection)

    return accounts.map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: ChannelMembership.fromAccountInfo(acc.account)[0],
      }
    })
  }

  /**
   * Load list of {@link ChannelMeta}
   */
  async loadMetas(filter: { channel?: PublicKey } = {}) {
    const builder = ChannelMeta.gpaBuilder()
      .addFilter('accountDiscriminator', channelMetaDiscriminator)
      .addFilter('authority', this.provider.publicKey)

    if (filter.channel) {
      builder.addFilter('channel', filter.channel)
    }

    const accounts = await builder.run(this.provider.connection)

    return accounts.map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: ChannelMeta.fromAccountInfo(acc.account)[0],
      }
    })
  }

  /**
   * Load list of {@link ChannelMembership}
   */
  async loadMemberships() {
    const request = ChannelMembership.gpaBuilder()
      .addFilter('accountDiscriminator', channelMembershipDiscriminator)
      .addFilter('authority', this.provider.publicKey)

    const accounts = await request.run(this.provider.connection)

    return accounts.map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: ChannelMembership.fromAccountInfo(acc.account)[0],
      }
    })
  }

  /**
   * Load {@link ChannelMembership} by {@link addr}
   */
  async loadMembership(addr: PublicKey, commitment?: Commitment) {
    return ChannelMembership.fromAccountAddress(this.provider.connection, addr, commitment)
  }

  /**
   * Get channel membership PDA
   */
  getMembershipPDA(channel: PublicKey, authority?: PublicKey) {
    authority = authority ?? this.provider.publicKey
    return PublicKey.findProgramAddressSync([channel.toBuffer(), authority.toBuffer()], this.programId)
  }

  /**
   * Load list of {@link ChannelDevice} for the {@link channel}
   */
  async loadDevices(channel: PublicKey, authority?: PublicKey) {
    const request = ChannelDevice.gpaBuilder()
      .addFilter('accountDiscriminator', channelDeviceDiscriminator)
      .addFilter('authority', authority ?? this.provider.publicKey)
      .addFilter('channel', channel)

    const accounts = await request.run(this.provider.connection)

    return accounts.map(acc => ({
      pubkey: acc.pubkey,
      data: ChannelDevice.fromAccountInfo(acc.account)[0],
    }))
  }

  /**
   * Load {@link ChannelDevice} by {@link addr}
   */
  async loadDevice(addr: PublicKey, commitment?: Commitment) {
    return ChannelDevice.fromAccountAddress(this.provider.connection, addr, commitment)
  }

  /**
   * Get channel device PDA
   */
  getDevicePDA(membership: PublicKey, addr?: PublicKey) {
    addr = addr ?? this.keypair!.publicKey
    return PublicKey.findProgramAddressSync([membership.toBuffer(), addr.toBuffer()], this.programId)
  }

  /**
   * Load {@link ChannelMeta} by {@link addr}
   */
  async loadMeta(addr: PublicKey, commitment?: Commitment) {
    return ChannelMeta.fromAccountAddress(this.provider.connection, addr, commitment)
  }

  /**
   * Get channel meta PDA
   */
  getMetaPDA(channel: PublicKey, key: number, authority?: PublicKey) {
    authority = authority ?? this.provider.publicKey
    return PublicKey.findProgramAddressSync([
      Buffer.from(META_SEED),
      channel.toBuffer(),
      authority.toBuffer(),
      Uint8Array.from([key & 0xFF, (key >> 8) & 0xFF]),
    ], this.programId)
  }

  /**
   * Encrypt {@link cek} with {@link key or @link keypair.publicKey}
   */
  async encryptCEK(cek: Uint8Array, key?: PublicKey) {
    return encryptCEK(cek, key ?? this.keypair!.publicKey)
  }

  /**
   * Decrypt {@link cek} with {@link secretKey} or {@link keypair.secretKey}
   */
  async decryptCEK(cek: CEKData, secretKey?: Uint8Array) {
    return decryptCEK(cek, secretKey ?? this.keypair!.secretKey)
  }

  /**
   * Encrypt {@link message} with content encryption key {@link cek}
   */
  async encryptMessage(message: string, cek: Uint8Array) {
    return encryptMessage(message, cek)
  }

  /**
   * Decrypt {@link encryptedMessage} with content encryption key {@link cek}
   */
  async decryptMessage(encryptedMessage: string, cek: CEK) {
    return decryptMessage(encryptedMessage, cek)
  }

  /**
   * Initialize new channel
   */
  async initChannel(props: InitChannelProps, opts?: ConfirmOptions) {
    const channel = props.channel ?? Keypair.generate()
    const cek = await generateCEK()
    const cekEncrypted = await this.encryptCEK(cek)

    const [membership] = this.getMembershipPDA(channel.publicKey)
    const [device] = this.getDevicePDA(membership)
    const authority = this.provider.publicKey

    const tx = new Transaction()

    const space = this.channelSpace(props.maxMessages)

    tx.add(
      SystemProgram.createAccount({
        fromPubkey: authority,
        newAccountPubkey: channel.publicKey,
        lamports: await this.connection.getMinimumBalanceForRentExemption(
          space,
          opts?.commitment,
        ),
        space,
        programId: this.programId,
      }),
    )

    tx.add(
      createInitChannelInstruction({
        key: this.keypair!.publicKey,
        channel: channel.publicKey,
        membership,
        device,
        authority,
      }, {
        data: {
          workspace: props.workspace ?? '',
          name: props.name,
          public: props.public ?? false,
          permissionless: props.permissionless ?? false,
          memberName: props.memberName ?? '',
          maxMessages: props.maxMessages,
          cek: cekEncrypted,
        },
      }),
    )

    if (props.meta) {
      for (const { key, value } of props.meta) {
        const [meta] = this.getMetaPDA(channel.publicKey, key)
        tx.add(
          createAddMetaInstruction({
            channel: channel.publicKey,
            authority: this.provider.publicKey,
            meta,
          }, { data: { key, value: Buffer.from(value) } }),
        )
      }
    }

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, [channel, this.keypair as Signer], opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature, channel, cek, cekEncrypted }
  }

  /**
   * Delete channel
   */
  async deleteChannel({ channel }: DeleteChannelProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [authorityMembership] = this.getMembershipPDA(channel)

    const tx = new Transaction()

    tx.add(
      createDeleteChannelInstruction({ channel, authority, authorityMembership }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? errorFromName('Unauthorized')
    }

    return { signature }
  }

  /**
   * Join channel
   */
  async joinChannel(props: JoinChannelProps, opts?: ConfirmOptions) {
    const [membership] = this.getMembershipPDA(props.channel)
    const [device] = this.getDevicePDA(membership)
    const authority = this.provider.publicKey
    const key = this.keypair!.publicKey

    const tx = new Transaction()

    tx.add(
      createJoinChannelInstruction({
        channel: props.channel,
        membership,
        device,
        authority,
        key,
      }, {
        data: {
          name: props.name,
          authority: props.authority ?? null,
        },
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, [this.keypair as Signer], opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Leave the channel
   */
  async leaveChannel(props: LeaveChannelProps, opts?: ConfirmOptions) {
    const [membership] = this.getMembershipPDA(props.channel)
    const authority = this.provider.publicKey

    const tx = new Transaction()

    const devices = await this.loadDevices(props.channel)

    tx.add(
      createLeaveChannelInstruction({
        channel: props.channel,
        membership,
        authority,
        anchorRemainingAccounts: devices.map(acc => ({
          pubkey: acc.pubkey,
          isSigner: false,
          isWritable: true,
        })),
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Add new member to the channel
   */
  async addMember(props: AddMemberProps, opts?: ConfirmOptions) {
    const key = props.key ?? props.invitee

    const [authorityMembership] = this.getMembershipPDA(props.channel)
    const [authorityDevice] = this.getDevicePDA(authorityMembership)
    const [inviteeMembership] = this.getMembershipPDA(props.channel, props.invitee)
    const [inviteeDevice] = this.getDevicePDA(inviteeMembership, key)

    const device = await this.loadDevice(authorityDevice)
    // const membership = await this.loadMembership(authorityMembership)

    if (!device.cek.encryptedKey) {
      throw errorFromName('Unauthorized')
    }

    const rawCek = await this.decryptCEK(device.cek)
    const cek = await this.encryptCEK(rawCek, key)

    const tx = new Transaction()

    tx.add(
      createAddMemberInstruction({
        channel: props.channel,
        authority: this.provider.publicKey,
        invitee: props.invitee,
        authorityMembership,
        inviteeMembership,
        inviteeDevice,
      }, {
        data: {
          name: props.name ?? '',
          flags: props.flags ?? 0,
          cek,
          key,
        },
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Delete channel member
   */
  async deleteMember(props: DeleteMemberProps, opts?: ConfirmOptions) {
    const [membership] = this.getMembershipPDA(props.channel, props.authority)
    const [authorityMembership] = this.getMembershipPDA(props.channel)
    const authority = this.provider.publicKey

    const devices = await this.loadDevices(props.channel, props.authority)

    const tx = new Transaction()

    tx.add(
      createDeleteMemberInstruction({
        channel: props.channel,
        membership,
        membershipAuthority: props.authority,
        authority,
        authorityMembership,
        anchorRemainingAccounts: devices.map(acc => ({
          pubkey: acc.pubkey,
          isSigner: false,
          isWritable: true,
        })),
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      console.log(e)
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Authorize member request
   */
  async authorizeMember(props: AuthorizeMemberProps, opts?: ConfirmOptions) {
    const key = props.key ?? props.authority
    const [authorityMembership] = this.getMembershipPDA(props.channel)
    const [authorityDevice] = this.getDevicePDA(authorityMembership)
    const [membership] = this.getMembershipPDA(props.channel, props.authority)
    const [device] = this.getDevicePDA(membership, key)

    const authorityDeviceInfo = await this.loadDevice(authorityDevice)

    if (!authorityDeviceInfo.cek.encryptedKey) {
      throw errorFromName('Unauthorized')
    }

    const rawCek = await this.decryptCEK(authorityDeviceInfo.cek)
    const cek = await this.encryptCEK(rawCek, key)

    const tx = new Transaction()

    tx.add(
      createAuthorizeMemberInstruction({
        channel: props.channel,
        membership,
        device,
        authority: this.provider.publicKey,
        authorityMembership,
      }, { data: { cek } }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? errorFromName('Unauthorized')
    }

    return { signature }
  }

  /**
   * Grant new access to the member
   */
  async grantAccessMember(props: GrantAccessMemberProps, opts?: ConfirmOptions) {
    const [authorityMembership] = this.getMembershipPDA(props.channel)
    const [membership] = this.getMembershipPDA(props.channel, props.authority)

    const tx = new Transaction()

    tx.add(
      createGrantAccessMemberInstruction({
        channel: props.channel,
        membership,
        authority: this.provider.publicKey,
        authorityMembership,
      }, { data: { flags: props.flags } }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? errorFromName('Unauthorized')
    }

    return { signature }
  }

  /**
   * Add new device to the channel
   */
  async addDevice(props: AddDeviceProps, opts?: ConfirmOptions) {
    const [authorityMembership] = this.getMembershipPDA(props.channel)
    const [authorityDevice] = this.getDevicePDA(authorityMembership)
    const [newDevice] = this.getDevicePDA(authorityMembership, props.key)

    const device = await this.loadDevice(authorityDevice)

    if (!device?.cek.encryptedKey) {
      throw errorFromName('Unauthorized')
    }

    const rawCek = await this.decryptCEK(device.cek)
    const cek = await this.encryptCEK(rawCek, props.key)

    const tx = new Transaction()

    tx.add(
      createAddDeviceInstruction({
        channel: props.channel,
        authority: this.provider.publicKey,
        membership: authorityMembership,
        device: newDevice,
      }, { data: { cek, key: props.key } }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Delete device
   */
  async deleteDevice(props: DeleteDeviceProps, opts?: ConfirmOptions) {
    const deviceAuthority = props.authority ?? this.provider.publicKey
    const [authorityMembership] = this.getMembershipPDA(props.channel, deviceAuthority)
    const [device] = this.getDevicePDA(authorityMembership, props.key)

    const tx = new Transaction()

    tx.add(
      createDeleteDeviceInstruction({
        channel: props.channel,
        authority: this.provider.publicKey,
        device,
        deviceAuthority,
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Delete meta
   */
  async deleteMeta(props: DeleteMetaProps, opts?: ConfirmOptions) {
    const metaAuthority = props.authority ?? this.provider.publicKey
    const [meta] = this.getMetaPDA(props.channel, props.key)

    const tx = new Transaction()

    tx.add(
      createDeleteMetaInstruction({
        channel: props.channel,
        authority: this.provider.publicKey,
        metaAuthority,
        meta,
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Add new meta info for account and channel
   */
  async addMeta(props: AddMetaProps, opts?: ConfirmOptions) {
    const [meta] = this.getMetaPDA(props.channel, props.key)

    const tx = new Transaction()

    tx.add(
      createAddMetaInstruction({
        channel: props.channel,
        authority: this.provider.publicKey,
        meta,
      }, { data: { key: props.key, value: Buffer.from(props.value) } }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Add new message to the channel
   */
  async postMessage(props: PostMessageProps, opts?: ConfirmOptions) {
    const [authorityMembership] = this.getMembershipPDA(props.channel)

    let message
    let flags = 0
    if (props.encrypt) {
      const [authorityDevice] = this.getDevicePDA(authorityMembership)
      const device = await this.loadDevice(authorityDevice)
      if (!device.cek.header) {
        throw errorFromName('Unauthorized')
      }
      const cek = await this.decryptCEK(device.cek)
      message = await this.encryptMessage(props.message, cek)
      flags |= 0b001
    } else {
      message = props.message
    }

    const tx = new Transaction()

    tx.add(
      createPostMessageInstruction({
        channel: props.channel,
        membership: authorityMembership,
        authority: this.provider.publicKey,
      }, { message: String.fromCharCode(flags) + message }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Update message by id
   */
  async updateMessage(props: UpdateMessageProps, opts?: ConfirmOptions) {
    const [authorityMembership] = this.getMembershipPDA(props.channel)

    let message
    let flags = 0
    if (props.encrypt) {
      const [authorityDevice] = this.getDevicePDA(authorityMembership)
      const device = await this.loadDevice(authorityDevice)
      if (!device.cek.header) {
        throw errorFromName('Unauthorized')
      }
      const cek = await this.decryptCEK(device.cek)
      message = await this.encryptMessage(props.newMessage, cek)
      flags |= 0b001
    } else {
      message = props.newMessage
    }

    const tx = new Transaction()

    tx.add(
      createUpdateMessageInstruction({
        channel: props.channel,
        membership: authorityMembership,
        authority: this.provider.publicKey,
      }, {
        id: props.messageId,
        message: String.fromCharCode(flags) + message,
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Delete message by id
   */
  async deleteMessage(props: DeleteMessageProps, opts?: ConfirmOptions) {
    const [authorityMembership] = this.getMembershipPDA(props.channel)

    const tx = new Transaction()

    tx.add(
      createDeleteMessageInstruction({
        channel: props.channel,
        membership: authorityMembership,
        authority: this.provider.publicKey,
      }, { id: props.messageId }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Set the `lastReadMessageId` of the {@link ChannelMembership}
   */
  async readMessage(props: ReadMessageProps, opts?: ConfirmOptions) {
    const [authorityMembership] = this.getMembershipPDA(props.channel)

    const tx = new Transaction()

    tx.add(
      createReadMessageInstruction({
        channel: props.channel,
        membership: authorityMembership,
        authority: this.provider.publicKey,
      }, {
        messageId: props.messageId,
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, undefined, opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Get {@see Channel} account space in bytes
   */
  channelSpace(maxMessages = 1) {
    return Channel.byteSize({
      workspace: 'x'.repeat(this.constants.maxWorkspaceLength),
      name: 'x'.repeat(this.constants.maxChannelNameLength),
      creator: PublicKey.default,
      createdAt: 0,
      lastMessageAt: 0,
      flags: 0,
      memberCount: 0,
      messageCount: 0,
      maxMessages,
      messages: Array(maxMessages).fill({
        id: 0,
        sender: PublicKey.default,
        createdAt: 0,
        flags: 0,
        content: 'x'.repeat(this.constants.maxMessageLength),
      }),
    })
  }

  /**
   * Get {@see ChannelMembership} account space in bytes
   */
  channelMembershipSpace() {
    return ChannelMembership.byteSize({
      authority: PublicKey.default,
      channel: PublicKey.default,
      name: 'x'.repeat(this.constants.maxMemberNameLength),
      status: ChannelMembershipStatus.Authorized,
      statusTarget: PublicKey.default,
      lastReadMessageId: 0,
      createdAt: 0,
      flags: 0,
      bump: 0,
    })
  }

  /**
   * Get {@see ChannelDevice} account space in bytes
   */
  channelDeviceSpace() {
    return ChannelDevice.byteSize({
      authority: PublicKey.default,
      channel: PublicKey.default,
      key: PublicKey.default,
      cek: {
        encryptedKey: 'x'.repeat(this.constants.maxCEKLength),
        header: 'x'.repeat(72), // iv + tag + key (24 + 16 + 32)
      },
      bump: 0,
    })
  }
}

type DeleteChannelProps = {
  channel: PublicKey
}

type InitChannelProps = {
  name: string
  workspace?: string
  public?: boolean
  permissionless?: boolean
  memberName?: string
  maxMessages: number
  channel?: Keypair
  meta?: {
    key: number
    value: string | Uint8Array
  }[]
}

type JoinChannelProps = {
  channel: PublicKey
  name: string
  authority?: PublicKey
}

type LeaveChannelProps = {
  channel: PublicKey
}

type AddMemberProps = {
  channel: PublicKey
  invitee: PublicKey
  // By default, device key is the same as `invitee`
  key?: PublicKey
  name?: string
  flags?: number
}

type AuthorizeMemberProps = {
  channel: PublicKey
  authority: PublicKey
  key?: PublicKey
}

type GrantAccessMemberProps = {
  channel: PublicKey
  authority: PublicKey
  flags: number
}

type DeleteMemberProps = {
  channel: PublicKey
  authority: PublicKey
}

type DeleteMetaProps = {
  channel: PublicKey
  key: number
  authority?: PublicKey
}

type AddMetaProps = {
  channel: PublicKey
  key: number
  value: string | Uint8Array
}

type AddDeviceProps = {
  channel: PublicKey
  key: PublicKey
}

type DeleteDeviceProps = {
  channel: PublicKey
  key: PublicKey
  authority?: PublicKey
}

type PostMessageProps = {
  channel: PublicKey
  message: string
  encrypt?: boolean
}

type UpdateMessageProps = {
  channel: PublicKey
  messageId: number
  newMessage: string
  encrypt?: boolean
}

type ReadMessageProps = {
  channel: PublicKey
  messageId: number
}

type DeleteMessageProps = {
  channel: PublicKey
  messageId: number
}
