import type { AnchorProvider } from '@project-serum/anchor'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import type { Commitment } from '@solana/web3.js'
import type { CEKData } from './generated'
import {
  Channel,
  ChannelMembership,
  PROGRAM_ID,
  createAddMemberInstruction,
  createAuthorizeMemberInstruction,
  createDeleteChannelInstruction,
  createDeleteMemberInstruction,
  createInitChannelInstruction,
  createJoinChannelInstruction,
  createPostMessageInstruction,
  errorFromCode, errorFromName,
} from './generated'
import type { CEK } from './utils'
import { decryptCEK, decryptMessage, encryptCEK, encryptMessage, generateCEK } from './utils'

export class MessengerClient {
  programId = PROGRAM_ID

  constructor(
    private readonly provider: AnchorProvider,
    private keypair?: Keypair,
  ) {}

  get connection() {
    return this.provider.connection
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
    return Channel.gpaBuilder().run(this.provider.connection)
  }

  /**
   * Load channel by id
   */
  async loadChannel(addr: PublicKey, commitment?: Commitment) {
    return Channel.fromAccountAddress(this.provider.connection, addr, commitment)
  }

  /**
   * Load list of {@link Channel} participated by user
   */
  async loadMyChannels() {
    const accounts = await this.loadUserMemberships()
    console.log(accounts)
    // return this.provider.connection.getMultipleAccountsInfo()
    return []
  }

  /**
   * Load list of {@link ChannelMembership} for the {@link channel}
   */
  async loadChannelMembers(channel: PublicKey) {
    return ChannelMembership.gpaBuilder()
      .addFilter('channel', channel)
      .run(this.provider.connection)
  }

  /**
   * Load list of {@link ChannelMembership} for the {@link key}
   */
  async loadUserMemberships(key?: PublicKey) {
    return ChannelMembership.gpaBuilder()
      .addFilter('key', key ?? this.keypair.publicKey)
      .run(this.provider.connection)
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
    addr = addr ?? this.keypair.publicKey
    return await PublicKey.findProgramAddress([channel.toBuffer(), addr.toBuffer()], this.programId)
  }

  /**
   * Encrypt {@link cek} with {@link key or @link keypair.publicKey}
   */
  async encryptCEK(cek: Uint8Array, key?: PublicKey) {
    return encryptCEK(cek, key ?? this.keypair.publicKey)
  }

  /**
   * Decrypt {@link cek} with {@link secretKey} or {@link keypair.secretKey}
   */
  async decryptCEK(cek: CEKData, secretKey?: Uint8Array) {
    return decryptCEK(cek, secretKey ?? this.keypair.secretKey)
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

    const tx = new Transaction()

    tx.add(
      createInitChannelInstruction({
        channel: channel.publicKey,
        membership,
        authority: this.provider.publicKey,
        key: this.keypair.publicKey,
      }, {
        data: {
          name: props.name,
          maxMessages: props.maxMessages,
          cek: cekEncrypted,
        },
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, [channel, this.keypair])
    } catch (e) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature, channel, cek, cekEncrypted }
  }

  /**
   * Delete channel
   */
  async deleteChannel(channel: PublicKey) {
    const [authorityMembership] = await this.getMembershipPDA(channel)

    const tx = new Transaction()

    tx.add(
      createDeleteChannelInstruction({
        channel,
        authority: this.provider.publicKey,
        authorityMembership,
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx)
    } catch (e) {
      throw errorFromCode(e.code) ?? errorFromName('Unauthorized')
    }

    return { signature }
  }

  /**
   * Join channel
   */
  async joinChannel(props: JoinChannelProps) {
    const [membership] = await this.getMembershipPDA(props.channel)

    const tx = new Transaction()

    tx.add(
      createJoinChannelInstruction({
        channel: props.channel,
        authority: this.provider.publicKey,
        key: this.keypair.publicKey,
        membership,
      }, {
        data: {
          name: props.name,
          authority: props.authority,
        },
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, [this.keypair])
    } catch (e) {
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
    } catch (e) {
      throw errorFromCode(e.code) ?? errorFromName('Unauthorized')
    }

    return { signature }
  }

  /**
   * Add new participant to the channel
   */
  async deleteMember(props: DeleteMemberProps) {
    const [authorityMembership] = await this.getMembershipPDA(props.channel)
    const [membership] = await this.getMembershipPDA(props.channel, props.key)

    const tx = new Transaction()

    tx.add(
      createDeleteMemberInstruction({
        channel: props.channel,
        authority: this.provider.publicKey,
        authorityMembership,
        membership,
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx)
    } catch (e) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Add new participant to the channel
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
    } catch (e) {
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
    } catch (e) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }
}

interface InitChannelProps {
  name: string
  maxMessages: number
  channel?: Keypair
}

interface JoinChannelProps {
  channel: PublicKey
  name: string
  authority?: PublicKey
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
  key?: PublicKey
}

interface PostMessageProps {
  channel: PublicKey
  message: string
}
