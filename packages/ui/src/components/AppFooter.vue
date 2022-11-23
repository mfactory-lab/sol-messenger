<script setup lang="ts">
import {
  DISCORD_URL,
  JFACTORY_URL,
  JPOOL_URL,
  SVT_URL,
  TELEGRAM_ANNOUNCEMENT_URL,
  TELEGRAM_URL,
  TWITTER_URL,
} from '@/config'
const darkTheme = useDarkTheme()
</script>

<template>
  <q-footer>
    <div class="container">
      <div class="row">
        <div class="col-12 col-md-6">
          <div class="footer-links">
            <ul>
              <li><a target="_blank" :href="JFACTORY_URL">JFACTORY</a></li>
              <li>
                <a target="_blank" :href="JPOOL_URL">JPOOL</a>
              </li>
              <li>
                <a target="_blank" :href="SVT_URL">SOLANA VALIDATOR TOOLKIT</a>
              </li>
            </ul>
          </div>

          <div class="copyright">
            <span>© Copyright 2022 cgram.one. All rights reserved.<br>Powered by
              jFactory</span>
          </div>
        </div>

        <div class="col-12 col-md-6 social-col">
          <div class="social">
            <div class="theme">
              Dark theme
              <q-toggle
                :model-value="darkTheme.isActive.value"
                @click="darkTheme.toggle"
              />
            </div>
            <a :href="TELEGRAM_URL" target="_blank" class="social-link social-link-text">
              <span>official<br>channel</span>
            </a>
            <a :href="TELEGRAM_ANNOUNCEMENT_URL" target="_blank" class="social-link telegram" />
            <a :href="TWITTER_URL" target="_blank" class="social-link twitter" />
            <a :href="DISCORD_URL" target="_blank" class="social-link discord" />
          </div>
        </div>
      </div>
    </div>
  </q-footer>
</template>

<style lang="scss">
.q-footer {
  background: #455a64;
  padding: 40px 0;

  .footer-links {
    margin-bottom: 30px;

    ul {
      margin: 0 0 0 -8px;
      padding: 0;
      list-style-type: none;
      display: flex;
      flex-direction: row;

      li {
        a {
          display: flex;
          padding: 0 8px;
          color: #fff;
          text-decoration: underline;
          border-right: 1px solid #fff;
          line-height: 1;
          margin-right: 4px;
          font-weight: 400;
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
      text-decoration: none;

      &.telegram {
        background-image: url("@/assets/img/telegram.svg");
      }

      &.twitter {
        background-image: url("@/assets/img/twitter.svg");
      }

      &.discord {
        background-image: url("@/assets/img/discord.svg");
      }
    }

    &-link-text {
      display: flex;
      flex-direction: row;
      padding: 11px 14px;
      height: 47px;
      background-color: #fff;
      background-image: url("@/assets/img/telegram.svg");
      background-repeat: no-repeat;
      background-position: 80% 50%;
      border-radius: 50px;
      font-family: "Montserrat", sans-serif;
      width: 110px;

      span {
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        color: #455a64;
      }
    }
  }
}
</style>
