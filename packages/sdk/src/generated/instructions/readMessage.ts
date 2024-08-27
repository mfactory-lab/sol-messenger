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
 * @category ReadMessage
 * @category generated
 */
export type ReadMessageInstructionArgs = {
  messageId: beet.bignum
}
/**
 * @category Instructions
 * @category ReadMessage
 * @category generated
 */
export const readMessageStruct = new beet.BeetArgsStruct<
  ReadMessageInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['messageId', beet.u64],
  ],
  'ReadMessageInstructionArgs',
)
/**
 * Accounts required by the _readMessage_ instruction
 *
 * @property [_writable_] channel
 * @property [_writable_] membership
 * @property [**signer**] authority
 * @category Instructions
 * @category ReadMessage
 * @category generated
 */
export type ReadMessageInstructionAccounts = {
  channel: web3.PublicKey
  membership: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const readMessageInstructionDiscriminator = [
  54, 166, 48, 51, 234, 46, 110, 163,
]

/**
 * Creates a _ReadMessage_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category ReadMessage
 * @category generated
 */
export function createReadMessageInstruction(
  accounts: ReadMessageInstructionAccounts,
  args: ReadMessageInstructionArgs,
  programId = new web3.PublicKey('CgRaMXqqRHNT3Zo2uVZfX72TuxUgcLb8E3A8KrXnbXAC'),
) {
  const [data] = readMessageStruct.serialize({
    instructionDiscriminator: readMessageInstructionDiscriminator,
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
