import { ConfirmOptions, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'

/**
 * Initializes the provider with the given keypair and options.
 */
export function initProvider(keypair: Keypair, opts?: ConfirmOptions) {
  opts = {
    ...opts,
    // skipPreflight: true,
    commitment: 'processed',
    // preflightCommitment: 'confirmed',
  }
  return new AnchorProvider(
    new Connection('http://127.0.0.1:8899', opts),
    new Wallet(keypair),
    {
      ...AnchorProvider.defaultOptions(),
      ...opts,
    },
  )
}

class PublicKeyInitData {
}

/**
 * Requests an airdrop of a specified amount of SOL to the given public key address.
 */
export async function requestAirdrop(connection: Connection, addr: PublicKeyInitData, amount = 100) {
  const signature = await connection.requestAirdrop(new PublicKey(addr), amount * LAMPORTS_PER_SOL)
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }, 'confirmed')
}
