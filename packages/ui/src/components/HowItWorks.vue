<script lang="ts" setup>
import { PlusIcon, SearchIcon, TransferInIcon } from 'vue-tabler-icons'
import searchIcon from '@/assets/img/search.svg'
import transferIcon from '@/assets/img/transfer.svg'
import plusIcon from '@/assets/img/plus.svg'

const join = [
  'For <span>public channels</span>, you can read or send messages without limitations.',
  `In order to join one of the existing private channels, click
        <img src="${searchIcon}" class="icon" alt="search">
        (BROWSE CHANNELS) at the bottom of the left-side panel.`,
  `Find a channel you are interested in and click
        <img src="${transferIcon}" class="icon" alt="transfer">
        (REQUEST TO JOIN). Your status for that channel will be set to Pending
        Approval until your request has been accepted. While awaiting approval,
        all messages in the channel will appear scrambled.`,
  `After the private channel's owner or admin approves your membership,your
        status will change to Authorized. You will be able to read the channel
        and send messages.`,
]

const create = [
  'You can create a channel of your own as well.',
  `Click <img src="${plusIcon}" class="icon" alt="search"> (CREATE A CHANNEL) 
  at the bottom of the left-side panel, then choose between Private and Public options.`,
  'A public channel is open to anyone for reading and writing, and no encryption is used.',
  `If you create a private channel, joining it will require your approval. You will see a red 
  notification badge above the channel list if there are approval requests pending.`,
]
</script>

<template>
  <div class="how-it-works">
    <div class="app-info">
      <div class="app-info__title">
        JOIN A CHANNEL
      </div>

      <ul class="app-info__list">
        <li v-for="t in join" :key="t">
          <p v-html="t" />
        </li>
      </ul>
    </div>

    <div class="app-info">
      <div class="app-info__title">
        CREATE YOUR OWN CHANNEL
      </div>

      <ul class="app-info__list">
        <li v-for="t in create" :key="t">
          <p v-html="t" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.how-it-works {
  width: 90vw;
  margin: 0 auto;
  padding-bottom: 28px;
  position: relative;
  display: flex;
  justify-content: space-between;

  @media (max-width: $breakpoint-xs) {
    flex-direction: column;
    margin: 30px auto 10px;
}

}

.app-info {
  color: $primary;
  padding: 38px 0 0;
  width: 45%;

  @media (max-width: $breakpoint-xs) {
    width: 95%;
  }

  &__title {
    font-weight: 700;
    font-size: 17px;
    line-height: 20px;
    text-transform: uppercase;
  }

  &__list {
    li {
      p {
        margin: 0;
        font-size: 12px;

        span {
          font-weight: 600;
        }
      }

      .icon {
        width: 14px;
        height: 14px;
        padding: 1px;
        background: $primary;
        transform: translateY(2px);
      }
    }
  }
}
</style>
