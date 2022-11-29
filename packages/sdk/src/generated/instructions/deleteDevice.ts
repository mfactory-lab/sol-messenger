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
 * @category DeleteDevice
 * @category generated
 */
export const deleteDeviceStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'DeleteDeviceInstructionArgs',
)
/**
 * Accounts required by the _deleteDevice_ instruction
 *
 * @property [_writable_] channel
 * @property [_writable_] device
 * @property [_writable_] deviceAuthority
 * @property [**signer**] authority
 * @category Instructions
 * @category DeleteDevice
 * @category generated
 */
export interface DeleteDeviceInstructionAccounts {
  channel: web3.PublicKey
  device: web3.PublicKey
  deviceAuthority: web3.PublicKey
  authority: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const deleteDeviceInstructionDiscriminator = [
  168, 96, 86, 82, 105, 2, 215, 144,
]

/**
 * Creates a _DeleteDevice_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category DeleteDevice
 * @category generated
 */
export function createDeleteDeviceInstruction(
  accounts: DeleteDeviceInstructionAccounts,
  programId = new web3.PublicKey('6RSutwAoRcQPAMwyxZdNeG76fdAxzhgxkCJXpqKCBPdm'),
) {
  const [data] = deleteDeviceStruct.serialize({
    instructionDiscriminator: deleteDeviceInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.channel,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.device,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.deviceAuthority,
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