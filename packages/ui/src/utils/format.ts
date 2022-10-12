import { BN } from '@project-serum/anchor'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Decimal } from 'decimal.js'

const SOL_DECIMALS = 9

export const formatPct = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
})

export function lamportsToSol(lamports: number | bigint | BN) {
  if (typeof lamports === 'number') {
    return Number(Number(Math.abs(lamports) / LAMPORTS_PER_SOL).toFixed(SOL_DECIMALS))
  }
  lamports = new BN(String(lamports))
  let signMultiplier = 1
  if (lamports.isNeg()) {
    signMultiplier = -1
  }
  const absLamports = lamports.abs()
  const lamportsString = absLamports.toString(10).padStart(10, '0')
  const splitIndex = lamportsString.length - SOL_DECIMALS
  const solString = `${lamportsString.slice(0, splitIndex)}.${lamportsString.slice(splitIndex)}`
  return signMultiplier * parseFloat(solString)
}

export function lamportsToSolString(lamports: number | BN, maximumFractionDigits = SOL_DECIMALS): String {
  const sol = lamportsToSol(lamports)
  return `◎ ${new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(sol)}`
}

export function solToLamports(amount: number | string) {
  return new Decimal(Number(amount)).mul(new Decimal(LAMPORTS_PER_SOL)).round().toNumber()
}
