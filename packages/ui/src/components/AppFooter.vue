<script setup lang="ts">
import {
  DISCORD_URL,
  JFACTORY_URL,
  JPOOL_URL,
  STAKIG_KIWI_URL,
  SVT_URL,
  TELEGRAM_ANNOUNCEMENT_URL,
  TELEGRAM_URL,
  TWITTER_URL,
} from '@/config'

const darkTheme = useDarkTheme()
const { state } = useAppSizeStore()

const socialLinks = [
  {
    name: 'JFACTORY',
    link: JFACTORY_URL,
  },
  {
    name: 'JPOOL',
    link: JPOOL_URL,
  },
  {
    name: 'STAKING KIWI',
    link: STAKIG_KIWI_URL,
  },
  {
    name: 'SOLANA VALIDATOR TOOLKIT',
    link: SVT_URL,
  },
]

const isUpIcon = ref(true)

function handleArrow() {
  state.isFooter = !state.isFooter
  setTimeout(() => (isUpIcon.value = !isUpIcon.value), 500)
}
</script>

<template>
  <footer :class="{ 'show-footer': state.isFooter }">
    <div class="container">
      <div class="footer-section">
        <div class="footer-info">
          <div class="theme">
            Dark mode

            <label class="switch">
              <input
                v-model="darkTheme.isActive.value"
                type="checkbox"
                @click="darkTheme.toggle"
              >
              <span class="slider round" />
            </label>
          </div>
          <div class="copyright">
            © Copyright 2022 cgram.one. All rights reserved.<br>Powered by
            jFactory
          </div>
        </div>

        <div class="footer-links">
          <div class="social">
            <a
              :href="TELEGRAM_URL"
              target="_blank"
              class="social-link social-link-text"
            >
              <span>official<br>channel</span>
            </a>
            <a
              :href="TELEGRAM_ANNOUNCEMENT_URL"
              target="_blank"
              class="social-link telegram"
            />
            <a
              :href="TWITTER_URL"
              target="_blank"
              class="social-link twitter"
            />
            <a
              :href="DISCORD_URL"
              target="_blank"
              class="social-link discord"
            />
          </div>
          <nav>
            <ul>
              <li v-for="{ name, link } in socialLinks" :key="name">
                <a target="_blank" :href="link">{{ name }}</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss">
footer {
  background: #455a64;
  padding: 19px 0;
  position: relative;

  .container {
    min-width: 90%;
  }
  .footer {
    &-section {
      display: flex;
      align-items: center;
      justify-content: space-between;

      @media (max-width: $breakpoint-xs) {
        flex-direction: column-reverse;
        gap: 20px;
      }
    }

    &-info {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-direction: column;
      gap: 10px;
    }

    &-links {
      display: flex;
      flex-direction: column;
      gap: 10px;

      @media (max-width: $breakpoint-xs) {
        gap: 15px;
      }
    }
  }

  .theme {
    text-transform: uppercase;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  nav {
    font-size: 11px;
    display: flex;
    justify-content: flex-end;

    ul {
      margin: 0 0 0 -8px;
      padding: 0;
      list-style-type: none;
      display: flex;
      flex-direction: row;

      li {
        a {
          display: flex;
          padding: 0 6px;
          color: #fff;
          text-decoration: underline;
          border-right: 1px solid #fff;
          line-height: 1;
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
    }
  }

  .copyright {
    font-size: 11px;
    color: #fff;
    transform: translateY(2px);

    @media (max-width: $breakpoint-sm) {
      width: 100%;
    }
  }

  .social {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 8px;

    @media (max-width: $breakpoint-xs) {
      justify-content: center;
      gap: 15px;
    }

    &-link {
      width: 47px;
      height: 47px;
      border-radius: 50%;
      background-color: #fff;
      background-repeat: no-repeat;
      background-position: 50% 50%;
      text-decoration: none;

      &.telegram {
        background-image: url("@/assets/img/telegram.svg");
        background-position: 40% 50%;
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
      background-position: 83% 50%;
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

//toggle

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $primary;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border: 1px solid #fff;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #d3d9de;

  &::before {
    background-color: $primary;
  }
}

input:focus + .slider {
  box-shadow: 0 0 1px #c9ccce;
}

input:checked + .slider:before {
  -webkit-transform: translateX(25px);
  -ms-transform: translateX(25px);
  transform: translateX(25px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
