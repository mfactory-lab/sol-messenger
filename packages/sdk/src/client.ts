import { BorshCoder, EventManager } from '@project-serum/anchor'
import type { AnchorProvider } from '@project-serum/anchor'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import type { Commitment, Signer } from '@solana/web3.js'
import idl from '../idl/messenger.json'
import type { CEKData } from './generated'

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
   */
  async loadMyChannels() {
    const accounts = await this.loadMemberships()
    console.log(accounts)
    // return this.provider.connection.getMultipleAccountsInfo()
    return []
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
   * Load list of {@link ChannelMembership} for the {@link key}
   */
  async loadMemberships(key?: PublicKey) {
    const accounts = await ChannelMembership.gpaBuilder()
      .addFilter('accountDiscriminator', channelMembershipDiscriminator)
      .addFilter('authority', this.provider.publicKey)
      .addFilter('key', key ?? null)
      .run(this.provider.connection)

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
          memberName: props.memberName ?? '',
          maxMessages: props.maxMessages,
          cek: cekEncrypted,
        },
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, [channel, this.keypair as Signer])
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature, channel, cek, cekEncrypted }
  }

  /**
   * Delete channel
   */
  async deleteChannel(channel: PublicKey) {
    const tx = new Transaction()
    const authority = this.provider.publicKey

    tx.add(
      createDeleteChannelInstruction({
        channel,
        authority,
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
      signature = await this.provider.sendAndConfirm(tx, [this.keypair as Signer])
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
      signature = await this.provider.sendAndConfirm(tx, [this.keypair as Signer])
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
    const authority = this.provider.publicKey
    const tx = new Transaction()

    tx.add(
      createDeleteMemberInstruction({
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

    const membership = await this.loadMembership(membershipAddr)

    if (!membership.cek.header) {
      throw errorFromName('Unauthorized')
    }

    const cek = await this.decryptCEK(membership.cek)
    const encMessage = await this.encryptMessage(props.message, cek)

    const tx = new Transaction()

    tx.add(
      createPostMessageInstruction({
        channel: props.channel,
        membership: membershipAddr,
        authority: this.provider.publicKey,
      }, {
        message: encMessage,
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
}

interface InitChannelProps {
  name: string
  memberName?: string
  maxMessages: number
  channel?: Keypair
}

interface JoinChannelProps {
  channel: PublicKey
  name: string
  authority?: PublicKey
}

interface LeaveChannelProps {
  channel: PublicKey
}

interface AddMemberProps {
  channel: PublicKey
  invitee: PublicKey
  key?: PublicKey
  name?: string
}

interface AuthorizeMemberProps {
  channel: PublicKey
  key: PublicKey
}

interface DeleteMemberProps {
  channel: PublicKey
  membership?: PublicKey
  key?: PublicKey
}

interface PostMessageProps {
  channel: PublicKey
  message: string
}
