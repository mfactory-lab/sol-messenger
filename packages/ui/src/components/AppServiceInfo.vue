<template>
  <div class="row info-row">
    <div class="offset-0 offset-md-3" />
    <div class="col-6 col-md-3 flex-center info-col">
      <div class="info-title">
        How IT WORKS
      </div>
      <div class="info-text">
        <ul>
          <li>Connect your wallet</li>
          <li>Enter the amount of JPLT you want to swap or enter the amount of JPLU you want to get</li>
          <li>Click SWAP button</li>
          <li>Confirm the transaction in your wallet</li>
          <li>Done</li>
        </ul>
      </div>
    </div>
    <div class="col-6 col-md-5  logo-wrap">
      <router-link to="/">
        <img src="@/assets/img/solana-logo.svg" alt="solana logo">
      </router-link>
    </div>
    <div class="offset-0 offset-md-1" />
  </div>
</template>

<style lang="scss" scoped>
  .info-row {
    padding: 70px 0 100px 0;
    font-size: 11px;
    color: #455A64;
    line-height: 13px;
    font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif;

    .info-col {
      @media (max-width: $breakpoint-sm) {
        padding-left: 50px;
      }

      @media (max-width: $breakpoint-xs) {
        padding-left: 10px;
      }
    }

    .info-title {
      font-weight: 700;
      font-size: 17px;
      line-height: 19px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    ul {
      list-style-type: none;
      margin: 0;
      padding: 0;

      li {
        position: relative;
        padding-left: 6px;

        &:before {
          border-radius: 50%;
          width: 3px;
          height: 3px;
          background: #455A64;
          content: '';
          position: absolute;
          top: 4px;
          left: 0;
        }
      }
    }

    .logo-wrap {
      display: grid;
      place-content: center;

      a {
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
</style>
