/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import type { Message } from '../types/Message'
import { messageBeet } from '../types/Message'

/**
 * Arguments used to create {@link Channel}
 * @category Accounts
 * @category generated
 */
export interface ChannelArgs {
  workspace: string
  name: string
  creator: web3.PublicKey
  createdAt: beet.bignum
  lastMessageAt: beet.bignum
  flags: number
  memberCount: number
  messageCount: beet.bignum
  maxMessages: number
  messages: Message[]
}

export const channelDiscriminator = [49, 159, 99, 106, 220, 87, 219, 88]
/**
 * Holds the data for the {@link Channel} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class Channel implements ChannelArgs {
  private constructor(
    readonly workspace: string,
    readonly name: string,
    readonly creator: web3.PublicKey,
    readonly createdAt: beet.bignum,
    readonly lastMessageAt: beet.bignum,
    readonly flags: number,
    readonly memberCount: number,
    readonly messageCount: beet.bignum,
    readonly maxMessages: number,
    readonly messages: Message[],
  ) {}

  /**
   * Creates a {@link Channel} instance from the provided args.
   */
  static fromArgs(args: ChannelArgs) {
    return new Channel(
      args.workspace,
      args.name,
      args.creator,
      args.createdAt,
      args.lastMessageAt,
      args.flags,
      args.memberCount,
      args.messageCount,
      args.maxMessages,
      args.messages,
    )
  }

  /**
   * Deserializes the {@link Channel} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0,
  ): [Channel, number] {
    return Channel.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link Channel} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig,
  ): Promise<Channel> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig,
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find Channel account at ${address}`)
    }
    return Channel.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'CgRaMXqqRHNT3Zo2uVZfX72TuxUgcLb8E3A8KrXnbXAC',
    ),
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, channelBeet)
  }

  /**
   * Deserializes the {@link Channel} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [Channel, number] {
    return channelBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link Channel} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return channelBeet.serialize({
      accountDiscriminator: channelDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link Channel} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: ChannelArgs) {
    const instance = Channel.fromArgs(args)
    return channelBeet.toFixedFromValue({
      accountDiscriminator: channelDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link Channel} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: ChannelArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment,
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      Channel.byteSize(args),
      commitment,
    )
  }

  /**
   * Returns a readable version of {@link Channel} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      workspace: this.workspace,
      name: this.name,
      creator: this.creator.toBase58(),
      createdAt: (() => {
        const x = <{ toNumber: () => number }> this.createdAt
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      lastMessageAt: (() => {
        const x = <{ toNumber: () => number }> this.lastMessageAt
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      flags: this.flags,
      memberCount: this.memberCount,
      messageCount: (() => {
        const x = <{ toNumber: () => number }> this.messageCount
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      maxMessages: this.maxMessages,
      messages: this.messages,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const channelBeet = new beet.FixableBeetStruct<
  Channel,
  ChannelArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['workspace', beet.utf8String],
    ['name', beet.utf8String],
    ['creator', beetSolana.publicKey],
    ['createdAt', beet.i64],
    ['lastMessageAt', beet.i64],
    ['flags', beet.u8],
    ['memberCount', beet.u16],
    ['messageCount', beet.u64],
    ['maxMessages', beet.u16],
    ['messages', beet.array(messageBeet)],
  ],
  Channel.fromArgs,
  'Channel',
)
