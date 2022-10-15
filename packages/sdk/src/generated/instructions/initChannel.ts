/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type { InitChannelData } from '../types/InitChannelData'
import { initChannelDataBeet } from '../types/InitChannelData'

/**
 * @category Instructions
 * @category InitChannel
 * @category generated
 */
export interface InitChannelInstructionArgs {
  data: InitChannelData
}
/**
 * @category Instructions
 * @category InitChannel
 * @category generated
 */
export const initChannelStruct = new beet.FixableBeetArgsStruct<
  InitChannelInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', initChannelDataBeet],
  ],
  'InitChannelInstructionArgs',
)
/**
 * Accounts required by the _initChannel_ instruction
 *
 * @property [_writable_, **signer**] channel
 * @property [_writable_] membership
 * @property [_writable_, **signer**] authority
 * @property [**signer**] key
 * @category Instructions
 * @category InitChannel
 * @category generated
 */
export interface InitChannelInstructionAccounts {
  channel: web3.PublicKey
  membership: web3.PublicKey
  authority: web3.PublicKey
  key: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initChannelInstructionDiscriminator = [
  21, 200, 152, 39, 19, 178, 76, 47,
]

/**
 * Creates a _InitChannel_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitChannel
 * @category generated
 */
export function createInitChannelInstruction(
  accounts: InitChannelInstructionAccounts,
  args: InitChannelInstructionArgs,
  programId = new web3.PublicKey('6RSutwAoRcQPAMwyxZdNeG76fdAxzhgxkCJXpqKCBPdm'),
) {
  const [data] = initChannelStruct.serialize({
    instructionDiscriminator: initChannelInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.channel,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.membership,
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
