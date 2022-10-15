/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import type { AuthorizeMemberData } from '../types/AuthorizeMemberData'
import {
  authorizeMemberDataBeet,
} from '../types/AuthorizeMemberData'

/**
 * @category Instructions
 * @category AuthorizeMember
 * @category generated
 */
export interface AuthorizeMemberInstructionArgs {
  data: AuthorizeMemberData
}
/**
 * @category Instructions
 * @category AuthorizeMember
 * @category generated
 */
export const authorizeMemberStruct = new beet.FixableBeetArgsStruct<
  AuthorizeMemberInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', authorizeMemberDataBeet],
  ],
  'AuthorizeMemberInstructionArgs',
)
/**
 * Accounts required by the _authorizeMember_ instruction
 *
 * @property [] channel
 * @property [_writable_] membership
 * @property [**signer**] authority
 * @property [] authorityMembership
 * @category Instructions
 * @category AuthorizeMember
 * @category generated
 */
export interface AuthorizeMemberInstructionAccounts {
  channel: web3.PublicKey
  membership: web3.PublicKey
  authority: web3.PublicKey
  authorityMembership: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const authorizeMemberInstructionDiscriminator = [
  194, 123, 189, 175, 86, 225, 93, 128,
]

/**
 * Creates a _AuthorizeMember_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category AuthorizeMember
 * @category generated
 */
export function createAuthorizeMemberInstruction(
  accounts: AuthorizeMemberInstructionAccounts,
  args: AuthorizeMemberInstructionArgs,
  programId = new web3.PublicKey('6RSutwAoRcQPAMwyxZdNeG76fdAxzhgxkCJXpqKCBPdm'),
) {
  const [data] = authorizeMemberStruct.serialize({
    instructionDiscriminator: authorizeMemberInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.channel,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.membership,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.authorityMembership,
      isWritable: false,
      isSigner: false,
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
