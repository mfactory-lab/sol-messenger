/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import * as beet from '@metaplex-foundation/beet'
import { CEKData, cEKDataBeet } from './CEKData'

export type AddDeviceData = {
  key: web3.PublicKey
  cek: CEKData
}

/**
 * @category userTypes
 * @category generated
 */
export const addDeviceDataBeet = new beet.FixableBeetArgsStruct<AddDeviceData>(
  [
    ['key', beetSolana.publicKey],
    ['cek', cEKDataBeet],
  ],
  'AddDeviceData',
)
