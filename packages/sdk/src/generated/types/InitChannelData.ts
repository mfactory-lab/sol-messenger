/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { CEKData, cEKDataBeet } from './CEKData'

export type InitChannelData = {
  workspace: string
  name: string
  maxMessages: number
  memberName: string
  cek: CEKData
  public: boolean
  permissionless: boolean
}

/**
 * @category userTypes
 * @category generated
 */
export const initChannelDataBeet
  = new beet.FixableBeetArgsStruct<InitChannelData>(
    [
      ['workspace', beet.utf8String],
      ['name', beet.utf8String],
      ['maxMessages', beet.u16],
      ['memberName', beet.utf8String],
      ['cek', cEKDataBeet],
      ['public', beet.bool],
      ['permissionless', beet.bool],
    ],
    'InitChannelData',
  )
