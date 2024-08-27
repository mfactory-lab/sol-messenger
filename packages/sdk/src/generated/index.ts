import { PublicKey } from '@solana/web3.js'

export * from './accounts'
export * from './errors'
export * from './instructions'
export * from './types'

/**
 * Program address
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ADDRESS = 'CgRaMXqqRHNT3Zo2uVZfX72TuxUgcLb8E3A8KrXnbXAC'
// export const PROGRAM_ADDRESS = 'CGRAmxwrfg86KGaPJ3jD1ePgpebP6UJwSUHVZ1UQs78q'

/**
 * Program public key
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS)
