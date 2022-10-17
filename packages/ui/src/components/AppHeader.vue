<template>
  <q-header class="app-header">
    <div class="container">
      <q-toolbar>
        <div class="app-header__logo">
          <router-link to="/">
            SOM
          </router-link>
        </div>

        <q-space />

        <div class="app-header__nav">
          <a href="https://jpool.one" target="_blank">JPOOL</a>
          <a href="https://dev.svt.one" target="_blank">Validator toolkit</a>
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
