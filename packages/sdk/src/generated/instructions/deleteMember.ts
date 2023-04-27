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
 * @category DeleteMember
 * @category generated
 */
export const deleteMemberStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'DeleteMemberInstructionArgs',
)
/**
 * Accounts required by the _deleteMember_ instruction
 *
 * @property [_writable_] channel
 * @property [_writable_] membership
 * @property [_writable_] membershipAuthority
 * @property [] authorityMembership
 * @property [**signer**] authority
 * @category Instructions
 * @category DeleteMember
 * @category generated
 */
export interface DeleteMemberInstructionAccounts {
  channel: web3.PublicKey
  membership: web3.PublicKey
  membershipAuthority: web3.PublicKey
  authorityMembership: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const deleteMemberInstructionDiscriminator = [
  95, 14, 98, 112, 252, 218, 205, 173,
]

/**
 * Creates a _DeleteMember_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category DeleteMember
 * @category generated
 */
export function createDeleteMemberInstruction(
  accounts: DeleteMemberInstructionAccounts,
  programId = new web3.PublicKey('CgRaMXqqRHNT3Zo2uVZfX72TuxUgcLb8E3A8KrXnbXAC'),
) {
  const [data] = deleteMemberStruct.serialize({
    instructionDiscriminator: deleteMemberInstructionDiscriminator,
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
      pubkey: accounts.membershipAuthority,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authorityMembership,
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
