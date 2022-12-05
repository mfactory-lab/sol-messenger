/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type { JoinChannelData } from '../types/JoinChannelData'
import { joinChannelDataBeet } from '../types/JoinChannelData'

/**
 * @category Instructions
 * @category JoinChannel
 * @category generated
 */
export interface JoinChannelInstructionArgs {
  data: JoinChannelData
}
/**
 * @category Instructions
 * @category JoinChannel
 * @category generated
 */
export const joinChannelStruct = new beet.FixableBeetArgsStruct<
  JoinChannelInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', joinChannelDataBeet],
  ],
  'JoinChannelInstructionArgs',
)
/**
 * Accounts required by the _joinChannel_ instruction
 *
 * @property [_writable_] channel
 * @property [_writable_] membership
 * @property [_writable_] device
 * @property [_writable_, **signer**] authority
 * @property [**signer**] key
 * @category Instructions
 * @category JoinChannel
 * @category generated
 */
export interface JoinChannelInstructionAccounts {
  channel: web3.PublicKey
  membership: web3.PublicKey
  device: web3.PublicKey
  authority: web3.PublicKey
  key: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const joinChannelInstructionDiscriminator = [
  124, 39, 115, 89, 217, 26, 38, 29,
]

/**
 * Creates a _JoinChannel_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category JoinChannel
 * @category generated
 */
export function createJoinChannelInstruction(
  accounts: JoinChannelInstructionAccounts,
  args: JoinChannelInstructionArgs,
  programId = new web3.PublicKey('4AnSBTc21f4wTBHmnFyarbosr28Qk4CgGFBHcRh4kYPw'),
) {
  const [data] = joinChannelStruct.serialize({
    instructionDiscriminator: joinChannelInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.channel,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.membership,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.device,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.key,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
