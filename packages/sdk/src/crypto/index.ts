// import { VerificationMethod } from 'did-resolver/src/resolver';
// import { DIDDocument } from 'did-resolver';

import { randomBytes } from '@stablelib/random'

import * as u8a from 'uint8arrays'

import { convertPublicKey, convertSecretKey } from 'ed2curve-esm'
import type { PublicKey } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import {
  XC20P_IV_LENGTH,
  XC20P_TAG_LENGTH,
  x25519xc20pKeyUnwrap,
  x25519xc20pKeyWrap,
  xc20pDecrypter,
  xc20pEncrypter,
} from './xc20pEncryption'
import type { CEKData } from './models'
import {
  base58ToBytes,
  base64ToBytes,
  bytesToBase64,
  bytesToString,
  stringToBytes,
} from './utils'

// a 64-byte private key on the X25519 curve.
// In string form it is base58-encoded
export type PrivateKey = number[] | string | Buffer | Uint8Array
export type CEK = Uint8Array

/**
 * Create a Solana keypair object from an x25519 private key
 * @param privateKey
 */
export const makeKeypair = (privateKey: PrivateKey): Keypair => {
  if (Array.isArray(privateKey)) {
    return Keypair.fromSecretKey(Buffer.from(privateKey))
  }

  if (typeof privateKey === 'string') {
    return Keypair.fromSecretKey(base58ToBytes(privateKey))
  }

  if (privateKey instanceof Buffer || privateKey instanceof Uint8Array) {
    return Keypair.fromSecretKey(privateKey)
  }

  throw new Error('Incompatible private key format')
}

/**
 * Create a CEK
 */
export const generateCEK = async (length = 32): Promise<CEK> => {
  const cek = randomBytes(length)
  return Promise.resolve(cek)
}

/**
 * Encrypt the CEK for PublicKey
 */
export const encryptCEK = async (
  cek: CEK,
  pubKey: PublicKey,
): Promise<CEKData> => {
  const res = await x25519xc20pKeyWrap(convertPublicKey(pubKey.toBytes()))(cek)
  return {
    header: bytesToBase64(u8a.concat([res.iv, res.tag, res.epPubKey])),
    encryptedKey: bytesToBase64(res.encryptedKey),
  }
}

/**
 * Decrypt an encrypted CEK for the with the key that was used to encrypt it
 */
export const decryptCEK = async (
  encryptedCEK: CEKData,
  privateKey: PrivateKey,
): Promise<CEK> => {
  const encodedHeader = base64ToBytes(encryptedCEK.header)
  const iv = encodedHeader.subarray(0, XC20P_IV_LENGTH)
  const tag = encodedHeader.subarray(XC20P_IV_LENGTH, XC20P_IV_LENGTH + XC20P_TAG_LENGTH)
  const epkPub = encodedHeader.subarray(XC20P_IV_LENGTH + XC20P_TAG_LENGTH)
  const encryptedKey = base64ToBytes(encryptedCEK.encryptedKey)
  // normalise the key into an uint array
  const ed25519Key = makeKeypair(privateKey).secretKey
  // convert ed25519Key to x25519Key
  const curve25519Key = convertSecretKey(ed25519Key)

  const cek = await x25519xc20pKeyUnwrap(curve25519Key)(
    encryptedKey,
    tag,
    iv,
    epkPub,
  )

  if (cek === null) {
    throw new Error('There was a problem decrypting the CEK')
  }

  return cek
}

/**
 * Encrypt a message with a CEK
 */
export const encryptMessage = async (message: string, cek: CEK): Promise<string> => {
  const encryptMessage = await xc20pEncrypter(cek)(stringToBytes(message))
  return bytesToBase64(
    u8a.concat([
      encryptMessage.iv,
      encryptMessage.ciphertext,
      encryptMessage.tag,
    ]),
  )
}

/**
 * Decrypt a message with the CEK used to encrypt it
 */
export const decryptMessage = async (encryptedMessage: string, cek: CEK): Promise<string> => {
  const encMessage = base64ToBytes(encryptedMessage)
  const iv = encMessage.subarray(0, XC20P_IV_LENGTH)
  const ciphertext = encMessage.subarray(XC20P_IV_LENGTH, -XC20P_TAG_LENGTH)
  const tag = encMessage.subarray(-XC20P_TAG_LENGTH)

  const binMessage = await xc20pDecrypter(cek)(ciphertext, tag, iv)
  if (binMessage === null) {
    throw new Error('There was an error decoding the message!')
  }

  return bytesToString(binMessage)
}
