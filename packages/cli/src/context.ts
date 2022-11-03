import { Buffer } from 'buffer'
import fs from 'fs'
import { MessengerClient } from '@app/sdk'
import { AnchorProvider, Wallet, web3 } from '@project-serum/anchor'
import type { Cluster } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import { clusterUrl } from './utils'

export interface Context {
  cluster: Cluster | string
  provider: AnchorProvider
  client: MessengerClient
}

const context = {} as Context

export function initContext({ cluster, keypair }: { cluster: Cluster; keypair: string }) {
  const opts = AnchorProvider.defaultOptions()
  const endpoint = cluster.startsWith('http') ? cluster : clusterUrl(cluster)
  const connection = new web3.Connection(endpoint, opts.commitment)
  const wallet = new Wallet(Keypair.fromSecretKey(Buffer.from(JSON.parse(fs.readFileSync(keypair).toString()))))

  context.cluster = cluster
  context.provider = new AnchorProvider(connection, wallet, opts)
  context.client = new MessengerClient(context.provider, wallet.payer)

  return context
}

export function useContext() {
  return context
}
