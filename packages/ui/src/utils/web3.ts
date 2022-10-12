import type { ConfirmOptions, Connection, Signer, TransactionInstruction } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import type { AnchorWallet } from 'solana-wallets-vue'

export function shortenAddress(address: string | PublicKey, chars = 4): string {
  if (address instanceof PublicKey) {
    address = address.toBase58()
  }
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

/**
 * Send and sign transaction
 */
export async function sendTransaction(
  connection: Connection,
  wallet: AnchorWallet,
  instructions: TransactionInstruction[],
  signers?: Signer[],
  opts?: ConfirmOptions,
) {
  if (!wallet?.publicKey) {
    throw new Error('Wallet is not connected')
  }

  let tx: Transaction = new Transaction().add(...instructions)
  tx.feePayer = wallet.publicKey
  tx.recentBlockhash = (
    await connection.getLatestBlockhash(opts?.preflightCommitment)
  ).blockhash

  tx = await wallet.signTransaction(tx)

  if (signers && signers.length > 0) {
    tx.partialSign(...signers)
  }

  // if (simulate) {
  // const simulation = await connection.simulateTransaction(tx)
  // console.log('TX Simulation:', simulation)
  // return simulation
  // }

  const rawTx = tx.serialize()

  const result = await connection.sendRawTransaction(rawTx, {
    skipPreflight: true,
    // preflightCommitment: DEFAULT_COMMITMENT,
  })

  console.log('TX(signature): ', result.toString())
  console.log('TX(base64): ', rawTx?.toString('base64'))

  return result
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
