/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type { AddMetaData } from '../types/AddMetaData'
import { addMetaDataBeet } from '../types/AddMetaData'

/**
 * @category Instructions
 * @category AddMeta
 * @category generated
 */
export interface AddMetaInstructionArgs {
  data: AddMetaData
}
/**
 * @category Instructions
 * @category AddMeta
 * @category generated
 */
export const addMetaStruct = new beet.FixableBeetArgsStruct<
  AddMetaInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', addMetaDataBeet],
  ],
  'AddMetaInstructionArgs',
)
/**
 * Accounts required by the _addMeta_ instruction
 *
 * @property [_writable_] channel
 * @property [_writable_] meta
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category AddMeta
 * @category generated
 */
export interface AddMetaInstructionAccounts {
  channel: web3.PublicKey
  meta: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const addMetaInstructionDiscriminator = [
  98, 4, 232, 132, 215, 202, 101, 231,
]

/**
 * Creates a _AddMeta_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category AddMeta
 * @category generated
 */
export function createAddMetaInstruction(
  accounts: AddMetaInstructionAccounts,
  args: AddMetaInstructionArgs,
  programId = new web3.PublicKey('4AnSBTc21f4wTBHmnFyarbosr28Qk4CgGFBHcRh4kYPw'),
) {
  const [data] = addMetaStruct.serialize({
    instructionDiscriminator: addMetaInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.channel,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.meta,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: true,
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