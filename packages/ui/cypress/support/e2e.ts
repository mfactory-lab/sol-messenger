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
      '5dV4QCXN6Sgny4ccMtfkaYUepsNe6aACQYvoruTTiXxsrtPTuqbMUedC8TsPxUCvTzMVcuL1SK1C7uAEehpzN9HU',
    ),
  )
  // @ts-expect-error
  win.solana = PhantomWalletMock.create(DEVNET, payer, 'confirmed')
})

