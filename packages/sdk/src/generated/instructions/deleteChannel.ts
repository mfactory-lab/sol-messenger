/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category DeleteChannel
 * @category generated
 */
export const deleteChannelStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'DeleteChannelInstructionArgs',
)
/**
 * Accounts required by the _deleteChannel_ instruction
 *
 * @property [_writable_] channel
 * @property [_writable_] authorityMembership
 * @property [_writable_, **signer**] authority
 * @category Instructions
 * @category DeleteChannel
 * @category generated
 */
export interface DeleteChannelInstructionAccounts {
  channel: web3.PublicKey
  authorityMembership: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const deleteChannelInstructionDiscriminator = [
  145, 225, 187, 221, 157, 142, 114, 133,
]

/**
 * Creates a _DeleteChannel_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category DeleteChannel
 * @category generated
 */
export function createDeleteChannelInstruction(
  accounts: DeleteChannelInstructionAccounts,
  programId = new web3.PublicKey('4AnSBTc21f4wTBHmnFyarbosr28Qk4CgGFBHcRh4kYPw'),
) {
  const [data] = deleteChannelStruct.serialize({
    instructionDiscriminator: deleteChannelInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.channel,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authorityMembership,
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
