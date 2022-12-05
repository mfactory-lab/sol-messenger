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
 * @category PostMessage
 * @category generated
 */
export interface PostMessageInstructionArgs {
  message: string
}
/**
 * @category Instructions
 * @category PostMessage
 * @category generated
 */
export const postMessageStruct = new beet.FixableBeetArgsStruct<
  PostMessageInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['message', beet.utf8String],
  ],
  'PostMessageInstructionArgs',
)
/**
 * Accounts required by the _postMessage_ instruction
 *
 * @property [_writable_] channel
 * @property [] membership
 * @property [**signer**] authority
 * @category Instructions
 * @category PostMessage
 * @category generated
 */
export interface PostMessageInstructionAccounts {
  channel: web3.PublicKey
  membership: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const postMessageInstructionDiscriminator = [
  214, 50, 100, 209, 38, 34, 7, 76,
]

/**
 * Creates a _PostMessage_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category PostMessage
 * @category generated
 */
export function createPostMessageInstruction(
  accounts: PostMessageInstructionAccounts,
  args: PostMessageInstructionArgs,
  programId = new web3.PublicKey('4AnSBTc21f4wTBHmnFyarbosr28Qk4CgGFBHcRh4kYPw'),
) {
  const [data] = postMessageStruct.serialize({
    instructionDiscriminator: postMessageInstructionDiscriminator,
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
