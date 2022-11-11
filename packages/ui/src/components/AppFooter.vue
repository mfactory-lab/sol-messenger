<script setup lang="ts">
import { useDarkTheme } from '@/hooks/theme'
const { toggle, isActive } = useDarkTheme()
</script>

<template>
  <q-footer>
    <div class="container">
      <div class="row">
        <div class="col-12 col-md-6">
          <div class="footer-links">
            <ul>
              <li><a target="_blank" href="https://jpool.one">JPOOL</a></li>
              <li><a target="_blank" href="https://heartandsol.one">GAME</a></li>
              <li><a href="https://magiceden.io/marketplace/heartandsol">NFT Marketplace</a></li>
            </ul>
          </div>

          <div class="copyright">
            <span>© Copyright 2022 jpool.one. All rights reserved. Powered by mFactory GmbH</span>
          </div>
        </div>

        <div class="col-12 col-md-6 social-col">
          <div class="social">
            <div class="theme">
              Dark theme
              <q-toggle
                :model-value="isActive"
                @click="toggle"
              />
            </div>
            <div class="social-link social-link-text">
              <span>official<br>channel</span>
            </div>
            <div class="social-link telegram" />
            <div class="social-link twitter" />
            <div class="social-link discord" />
          </div>
        </div>
      </div>
    </div>
  </q-footer>
</template>

<style lang="scss">
.q-footer {
  background: #455A64;
  padding: 40px 0;

  .footer-links {
    margin-bottom: 30px;

    ul {
      margin: 0;
      padding: 0;
      list-style-type: none;
      display: flex;
      flex-direction: row;

      li {

        a {
          display: flex;
          padding: 0 8px;
          color: #fff;
          text-decoration: none;
          border-right: 1px solid #fff;
          line-height: 1;
          margin-right: 4px;
          font-weight: 500;
          opacity: 0.8;
          white-space: nowrap;

          &:hover {
            opacity: 1;
          }
        }

        &:last-of-type {
          a {
            border: none;
          }
        }
      }

      @media (max-width: $breakpoint-xs) {
        flex-direction: column;
        li {
          a {
            border: none;
            justify-content: center;
            padding: 10px 0;
          }
        }
      }
    }
  }

  .copyright {
    width: 70%;

    @media (max-width: $breakpoint-sm) {
      width: 100%;
    }
  }

  .social-col {
    display: flex;
    justify-content: flex-end;
    @media (max-width: $breakpoint-sm) {
      margin-top: 30px;
      justify-content: flex-start;
    }
  }

  .social {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: flex-end;

    @media (max-width: $breakpoint-xs) {
      justify-content: space-between;
      width: 100%;
    }

    &-link {
      width: 47px;
      height: 47px;
      border-radius: 50%;
      background-color: #fff;
      background-repeat: no-repeat;
      background-position: 50% 50%;
      margin-left: 8px;

      &.telegram {
        background-image: url('@/assets/img/telegram.svg');
      }

      &.twitter {
        background-image: url('@/assets/img/twitter.svg');
      }

      &.discord {
        background-image: url('@/assets/img/discord.svg');
      }
    }

    &-link-text {
      display: flex;
      flex-direction: row;
      padding: 11px 14px;
      height: 47px;
      background-color: #fff;
      background-image: url('@/assets/img/telegram.svg');
      background-repeat: no-repeat;
      background-position: 80% 50%;
      border-radius: 50px;
      font-family: "Montserrat",sans-serif;
      width: 110px;

      span {
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        color: #455A64;
      }
    }
  }
}
</style>
