/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'

export type AddMetaData = {
  key: number
  value: Uint8Array
}

/**
 * @category userTypes
 * @category generated
 */
export const addMetaDataBeet = new beet.FixableBeetArgsStruct<AddMetaData>(
  [
    ['key', beet.u16],
    ['value', beet.bytes],
  ],
  'AddMetaData',
)
