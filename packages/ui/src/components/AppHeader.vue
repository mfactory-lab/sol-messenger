<template>
  <q-header class="app-header">
    <div class="container">
      <q-toolbar>
        <div class="app-header__logo">
          <router-link to="/">
            SM
          </router-link>
        </div>

        <q-space />

        <div class="app-header__nav">
          <a href="https://jpool.one" target="_blank">JPOOL</a>
          <a href="https://heartandsol.one/hatching" target="_blank">HATCHING</a>
          <a href="https://heartandsol.one/freemint" target="_blank">AIRDROP</a>
          <a href="https://heartandsol.one/auction" target="_blank">NFT AUCTION</a>
          <a href="https://magiceden.io/marketplace/heartandsol" target="_blank">NFT Marketplace</a>
        </div>

        <q-space />

        <div class="app-header__right">
          <div class="app-header__buttons">
            <cluster-selector class="app-header__cluster-btn" />
            <connect-wallet class="app-header__wallet-btn" />
          </div>
        </div>
      </q-toolbar>
    </div>
  </q-header>
</template>
