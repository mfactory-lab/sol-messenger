import type { Commitment } from '@solana/web3.js'
import { clusterApiUrl } from '@solana/web3.js'
import type { Endpoint } from '@/store/connection'

export const ENDPOINTS: Endpoint[] = [
  {
    id: 'rpcpool-mainnet',
    name: 'RPCPool RPC',
    cluster: 'mainnet-beta',
    url: 'https://mainnet.rpcpool.com/',
  },
  {
    id: 'mainnet',
    name: 'Solana RPC',
    cluster: 'mainnet-beta',
    url: clusterApiUrl('mainnet-beta'),
  },
  {
    id: 'testnet',
    name: 'TestNet',
    cluster: 'testnet',
    url: 'https://testnet.rpcpool.com/',
  },
  {
    id: 'devnet',
    name: 'DevNet',
    cluster: 'devnet',
    url: 'https://devnet.rpcpool.com/',
  },
]

/**
 * Default cluster is devnet
 */
export const DEFAULT_ENDPOINT = ENDPOINTS.find(e => e.id === import.meta.env.VITE_CONNECTION_ENDPOINT) ?? ENDPOINTS[3]

/**
 * The level of commitment desired when querying state
 * <pre>
 *   'processed': Query the most recent block which has reached 1 confirmation by the connected node
 *   'confirmed': Query the most recent block which has reached 1 confirmation by the cluster
 *   'finalized': Query the most recent block which has been finalized by the cluster
 * </pre>
 */
export const DEFAULT_COMMITMENT: Commitment = 'confirmed'

export const DEFAULT_MONITOR_COMMITMENT: Commitment = 'confirmed'

export const DEFAULT_SEND_TIMEOUT = 15000

/**
 * Time to allow for the server to initially process a transaction (in milliseconds)
 */
export const DEFAULT_CONFIRM_TIMEOUT = 120000
