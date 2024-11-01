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
 * @category DeleteMessage
 * @category generated
 */
export type DeleteMessageInstructionArgs = {
  id: beet.bignum
}
/**
 * @category Instructions
 * @category DeleteMessage
 * @category generated
 */
export const deleteMessageStruct = new beet.BeetArgsStruct<
  DeleteMessageInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['id', beet.u64],
  ],
  'DeleteMessageInstructionArgs',
)
/**
 * Accounts required by the _deleteMessage_ instruction
 *
 * @property [_writable_] channel
 * @property [] membership
 * @property [**signer**] authority
 * @category Instructions
 * @category DeleteMessage
 * @category generated
 */
export type DeleteMessageInstructionAccounts = {
  channel: web3.PublicKey
  membership: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const deleteMessageInstructionDiscriminator = [
  198, 99, 22, 204, 200, 165, 54, 138,
]

/**
 * Creates a _DeleteMessage_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category DeleteMessage
 * @category generated
 */
export function createDeleteMessageInstruction(
  accounts: DeleteMessageInstructionAccounts,
  args: DeleteMessageInstructionArgs,
  programId = new web3.PublicKey('CgRaMXqqRHNT3Zo2uVZfX72TuxUgcLb8E3A8KrXnbXAC'),
) {
  const [data] = deleteMessageStruct.serialize({
    instructionDiscriminator: deleteMessageInstructionDiscriminator,
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
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
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
