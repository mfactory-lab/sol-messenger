import type { AnchorProvider } from '@project-serum/anchor'
import type { Commitment } from '@solana/web3.js'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import type { CEKData } from './generated'
import {
  AssociatedChannelAccount,
  Channel,
  PROGRAM_ID,
  createAddToChannelInstruction,
  createInitChannelInstruction, createPostMessageInstruction, errorFromCode,
} from './generated'
import type { CEK } from './utils'
import { decryptCEK, decryptMessage, encryptCEK, encryptMessage, generateCEK } from './utils'

export * from './generated'

export class MessengerClient {
  programId = PROGRAM_ID

  constructor(
    private readonly provider: AnchorProvider,
    private sender?: Keypair,
  ) {}

  /**
   * Set new sender keypair
   */
  setSender(sender: Keypair) {
    this.sender = sender
  }

  /**
   * Load channel by id
   */
  async loadChannel(addr: PublicKey, commitment?: Commitment) {
    return Channel.fromAccountAddress(this.provider.connection, addr, commitment)
  }

  /**
   * Load associated channel account by id
   */
  async loadAca(addr: PublicKey, commitment?: Commitment) {
    return AssociatedChannelAccount.fromAccountAddress(this.provider.connection, addr, commitment)
  }

  /**
   * Get associated channel key
   */
  async getAca(channel: PublicKey, addr?: PublicKey) {
    addr = addr ?? this.sender.publicKey
    return await PublicKey.findProgramAddress([channel.toBuffer(), addr.toBuffer()], this.programId)
  }

  /**
   * Encrypt [cek] with sender publicKey
   */
  async encryptCEK(cek: Uint8Array, publicKey?: PublicKey) {
    return encryptCEK(cek, publicKey ?? this.sender.publicKey)
  }

  /**
   * Decrypt [cek] with sender secretKey
   */
  async decryptCEK(cek: CEKData, secretKey?: Uint8Array) {
    return decryptCEK(cek, secretKey ?? this.sender.secretKey)
  }

  /**
   * Encrypt [message] with content encryption key [cek]
   */
  async encryptMessage(message: string, cek: Uint8Array) {
    return encryptMessage(message, cek)
  }

  /**
   * Decrypt [message] with content encryption key [cek]
   */
  async decryptMessage(encryptedMessage: string, cek: CEK) {
    return decryptMessage(encryptedMessage, cek)
  }

  /**
   * Initialize new channel
   */
  async initChannel(props: InitChannelProps) {
    const channel = Keypair.generate()
    const cek = await generateCEK()
    const cekEncrypted = await this.encryptCEK(cek)

    const [associatedChannelAccount] = await this.getAca(channel.publicKey)

    const tx = new Transaction()

    tx.add(
      createInitChannelInstruction({
        channel: channel.publicKey,
        authority: this.sender.publicKey,
        associatedChannelAccount,
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
      signature = await this.provider.sendAndConfirm(tx, [channel])
    } catch (e) {
      console.error(e)
      throw errorFromCode(e.code)
    }

    return { signature, channel, cek, cekEncrypted }
  }

  /**
   * Add new participant to the channel
   */
  async addToChannel(props: AddToChannelProps) {
    const [inviterAca] = await this.getAca(props.channel)
    const [inviteeAca] = await this.getAca(props.channel, props.invitee)

    const aca = await this.loadAca(inviterAca)
    const cek = await this.decryptCEK(aca.cek)

    const tx = new Transaction()

    tx.add(
      createAddToChannelInstruction({
        channel: props.channel,
        inviter: this.sender.publicKey,
        invitee: props.invitee,
        inviterAca,
        inviteeAca,
      }, {
        data: {
          cek: await this.encryptCEK(cek, props.invitee),
        },
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx)
    } catch (e) {
      throw errorFromCode(e.code)
    }

    return { signature }
  }

  /**
   * Add new message to the channel
   */
  async postMessage(props: PostMessageProps) {
    const sender = props.sender ?? this.sender
    const [associatedChannelAccount] = await this.getAca(props.channel, sender.publicKey)

    const aca = await this.loadAca(associatedChannelAccount)
    const cek = await this.decryptCEK(aca.cek, sender.secretKey)
    const encMessage = await this.encryptMessage(props.message, cek)

    const tx = new Transaction()

    tx.add(
      createPostMessageInstruction({
        channel: props.channel,
        sender: sender.publicKey,
        associatedChannelAccount,
      }, {
        message: encMessage,
      }),
    )

    let signature: string

    try {
      signature = await this.provider.sendAndConfirm(tx, [sender])
    } catch (e) {
      console.error(e)
      throw errorFromCode(e.code)
    }

    return { signature }
  }
}

interface InitChannelProps {
  name: string
  maxMessages: number
}

interface AddToChannelProps {
  channel: PublicKey
  invitee: PublicKey
}

interface PostMessageProps {
  channel: PublicKey
  message: string
  sender?: Keypair
}
