import { BorshCoder, EventManager } from '@project-serum/anchor'
import type { AnchorProvider } from '@project-serum/anchor'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import type { Commitment, ConfirmOptions, Signer } from '@solana/web3.js'
import idl from '../idl/messenger.json'
import type { CEKData, Message } from './generated'

import {
  Channel,
  ChannelMembership,
  PROGRAM_ID,
  channelDiscriminator,
  channelMembershipDiscriminator,
  createAddMemberInstruction,
  createAuthorizeMemberInstruction,
  createDeleteChannelInstruction,
  createDeleteMemberInstruction,
  createInitChannelInstruction,
  createJoinChannelInstruction,
  createLeaveChannelInstruction,
  createPostMessageInstruction,
  errorFromCode,
  errorFromName,
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
  Admin = AddMember | DeleteMember | AuthorizeMember,
  Owner = 0xFF,
}

export enum MessageFlags {
  isEncrypted = 0b001,
}

export class MessengerClient {
  programId = PROGRAM_ID

  _coder: BorshCoder
  _events: EventManager

  constructor(
    private readonly provider: AnchorProvider,
    private keypair?: Keypair,
  ) {
    this._coder = new BorshCoder(idl as any)
    this._events = new EventManager(this.programId, provider, this._coder)
  }

  get connection() {
    return this.provider.connection
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
    return this._events.addEventListener(eventName, callback)
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
  async loadAllChannels() {
    const accounts = await Channel.gpaBuilder()
      .addFilter('accountDiscriminator', channelDiscriminator)
      .run(this.provider.connection)

    return accounts.map((acc) => {
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
   * Load list of {@link Channel} participated by user
   * TODO: implement
   */
  async loadMyChannels() {
    const accounts = await this.loadMemberships()
    // return this.provider.connection.getMultipleAccountsInfo()
    return accounts
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
   * Load list of {@link ChannelMembership} for the device {@link key}
   */
  async loadMemberships(key?: PublicKey) {
    const request = ChannelMembership.gpaBuilder()
      .addFilter('accountDiscriminator', channelMembershipDiscriminator)
      .addFilter('authority', this.provider.publicKey)

    if (key) {
      request.addFilter('key', key)
    }

    const accounts = await request.run(this.provider.connection)

    return accounts.map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: ChannelMembership.fromAccountInfo(acc.account),
      }
    })
  }

  /**
   * Load {@link ChannelMembership} for {@link addr}
   */
  async loadMembership(addr: PublicKey, commitment?: Commitment) {
    return ChannelMembership.fromAccountAddress(this.provider.connection, addr, commitment)
  }

  /**
   * Get channel membership PDA
   */
  async getMembershipPDA(channel: PublicKey, addr?: PublicKey) {
    addr = addr ?? this.keypair!.publicKey
    return await PublicKey.findProgramAddress([channel.toBuffer(), addr.toBuffer()], this.programId)
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
  async initChannel(props: InitChannelProps) {
    const channel = props.channel ?? Keypair.generate()
    const cek = await generateCEK()
    const cekEncrypted = await this.encryptCEK(cek)

    const [membership] = await this.getMembershipPDA(channel.publicKey)
    const authority = this.provider.publicKey

    const tx = new Transaction()

    tx.add(
      createInitChannelInstruction({
        key: this.keypair!.publicKey,
        channel: channel.publicKey,
        membership,
        authority,
      }, {
        data: {
          name: props.name,
          public: props.public ?? false,
          permissionless: props.permissionless ?? false,
          memberName: props.memberName ?? '',
          maxMessages: props.maxMessages,
          cek: cekEncrypted,
        },
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, [channel, this.keypair as Signer], props.opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature, channel, cek, cekEncrypted }
  }

  /**
   * Delete channel
   */
  async deleteChannel({ channel, opts }: DeleteChannelProps) {
    const authority = this.provider.publicKey
    const [authorityMembership] = await this.getMembershipPDA(channel)

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
  async joinChannel(props: JoinChannelProps) {
    const [membership] = await this.getMembershipPDA(props.channel)
    const authority = this.provider.publicKey

    const tx = new Transaction()

    tx.add(
      createJoinChannelInstruction({
        channel: props.channel,
        key: this.keypair!.publicKey,
        membership,
        authority,
      }, {
        data: {
          name: props.name,
          authority: props.authority ?? null,
        },
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, [this.keypair as Signer], props.opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Leave the channel
   */
  async leaveChannel(props: LeaveChannelProps) {
    const [membership] = await this.getMembershipPDA(props.channel)
    const authority = this.provider.publicKey

    const tx = new Transaction()

    tx.add(
      createLeaveChannelInstruction({
        channel: props.channel,
        membership,
        authority,
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Add new member to the channel
   */
  async addMember(props: AddMemberProps) {
    const key = props.key ?? props.invitee

    const [authorityMembership] = await this.getMembershipPDA(props.channel)
    const [inviteeMembership] = await this.getMembershipPDA(props.channel, key)

    const membership = await this.loadMembership(authorityMembership)

    if (!membership.cek.encryptedKey) {
      throw errorFromName('Unauthorized')
    }

    const rawCek = await this.decryptCEK(membership.cek)
    const cek = await this.encryptCEK(rawCek, key)

    const tx = new Transaction()

    tx.add(
      createAddMemberInstruction({
        channel: props.channel,
        authority: this.provider.publicKey,
        invitee: props.invitee,
        authorityMembership,
        inviteeMembership,
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
      signature = await this.provider.sendAndConfirm(tx)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? errorFromName('Unauthorized')
    }

    return { signature }
  }

  /**
   * Delete channel member
   */
  async deleteMember(props: DeleteMemberProps) {
    const [membership] = props.membership ? [props.membership] : await this.getMembershipPDA(props.channel, props.key)
    const [authorityMembership] = await this.getMembershipPDA(props.channel)
    const authority = this.provider.publicKey
    const tx = new Transaction()

    tx.add(
      createDeleteMemberInstruction({
        channel: props.channel,
        membership,
        authority,
        authorityMembership,
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Authorize member request
   */
  async authorizeMember(props: AuthorizeMemberProps) {
    const [authorityMembership] = await this.getMembershipPDA(props.channel)
    const [membership] = await this.getMembershipPDA(props.channel, props.key)

    const authorityMembershipInfo = await this.loadMembership(authorityMembership)

    if (!authorityMembershipInfo.cek.encryptedKey) {
      throw errorFromName('Unauthorized')
    }

    const rawCek = await this.decryptCEK(authorityMembershipInfo.cek)
    const cek = await this.encryptCEK(rawCek, props.key)

    const tx = new Transaction()

    tx.add(
      createAuthorizeMemberInstruction({
        channel: props.channel,
        membership,
        authority: this.provider.publicKey,
        authorityMembership,
      }, { data: { cek } }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? errorFromName('Unauthorized')
    }

    return { signature }
  }

  /**
   * Add new message to the channel
   */
  async postMessage(props: PostMessageProps) {
    const [membershipAddr] = await this.getMembershipPDA(props.channel)

    let message
    let flags = 0
    if (props.encrypt) {
      const membership = await this.loadMembership(membershipAddr)
      if (!membership.cek.header) {
        throw errorFromName('Unauthorized')
      }
      const cek = await this.decryptCEK(membership.cek)
      message = await this.encryptMessage(props.message, cek)
      flags |= 0b001
    } else {
      message = props.message
    }

    const tx = new Transaction()

    tx.add(
      createPostMessageInstruction({
        channel: props.channel,
        membership: membershipAddr,
        authority: this.provider.publicKey,
      }, { message: String.fromCharCode(flags) + message }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  utils = {
    channel: {
      isPublic: (c: Channel) => (c.flags & ChannelFlags.IsPublic) > 0,
      isPermissionless: (c: Channel) => (c.flags & ChannelFlags.Permissionless) > 0,
    },
    member: {
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
}

interface DeleteChannelProps {
  channel: PublicKey
  opts?: ConfirmOptions
}

interface InitChannelProps {
  name: string
  public?: boolean
  permissionless?: boolean
  memberName?: string
  maxMessages: number
  channel?: Keypair
  opts?: ConfirmOptions
}

interface JoinChannelProps {
  channel: PublicKey
  name: string
  authority?: PublicKey
  opts?: ConfirmOptions
}

interface LeaveChannelProps {
  channel: PublicKey
  opts?: ConfirmOptions
}

interface AddMemberProps {
  channel: PublicKey
  invitee: PublicKey
  key?: PublicKey
  name?: string
  flags?: number
  opts?: ConfirmOptions
}

interface AuthorizeMemberProps {
  channel: PublicKey
  key: PublicKey
}

interface DeleteMemberProps {
  channel: PublicKey
  membership?: PublicKey
  key?: PublicKey
  opts?: ConfirmOptions
}

interface PostMessageProps {
  channel: PublicKey
  message: string
  encrypt?: boolean
  opts?: ConfirmOptions
}
