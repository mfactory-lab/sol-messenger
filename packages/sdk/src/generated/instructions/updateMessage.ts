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
 * @category UpdateMessage
 * @category generated
 */
export interface UpdateMessageInstructionArgs {
  id: beet.bignum
  message: string
}
/**
 * @category Instructions
 * @category UpdateMessage
 * @category generated
 */
export const updateMessageStruct = new beet.FixableBeetArgsStruct<
  UpdateMessageInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['id', beet.u64],
    ['message', beet.utf8String],
  ],
  'UpdateMessageInstructionArgs',
)
/**
 * Accounts required by the _updateMessage_ instruction
 *
 * @property [_writable_] channel
 * @property [] membership
 * @property [**signer**] authority
 * @category Instructions
 * @category UpdateMessage
 * @category generated
 */
export interface UpdateMessageInstructionAccounts {
  channel: web3.PublicKey
  membership: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const updateMessageInstructionDiscriminator = [
  23, 135, 34, 211, 96, 120, 107, 9,
]

/**
 * Creates a _UpdateMessage_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category UpdateMessage
 * @category generated
 */
export function createUpdateMessageInstruction(
  accounts: UpdateMessageInstructionAccounts,
  args: UpdateMessageInstructionArgs,
  programId = new web3.PublicKey('4AnSBTc21f4wTBHmnFyarbosr28Qk4CgGFBHcRh4kYPw'),
) {
  const [data] = updateMessageStruct.serialize({
    instructionDiscriminator: updateMessageInstructionDiscriminator,
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
