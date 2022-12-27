// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import { Keypair } from '@solana/web3.js'
import base58 from 'bs58'
import { DEVNET, PhantomWalletMock } from 'phan-wallet-mock'

Cypress.on('window:before:load', (win) => {
  // const payer = Keypair.generate();
  const payer = Keypair.fromSecretKey(
    base58.decode(
      'pnkjmtnqAHiYGEUfAQHAQYAUZPY8NhSskFMpy6tchGEXsR47LJb5jNbcHzyys5xTgV4XRD6YorLgyYKWP5GZioV',
    ),
  )
  // @ts-expect-error
  win.solana = PhantomWalletMock.create(DEVNET, payer, 'confirmed')
})

