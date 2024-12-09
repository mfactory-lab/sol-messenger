<script setup lang="ts">
import type { Channel } from '@cgram/sdk'
import type { PropType } from 'vue'
import { useWallet } from 'solana-wallets-vue'
import type { PublicKey } from '@solana/web3.js'
import { getBadgeColor } from '@/utils'

const props = defineProps({
  pubkey: {
    type: Object as PropType<PublicKey>,
    required: true,
  },
  channel: {
    type: Object as PropType<Channel>,
    required: true,
  },
  isActive: Boolean,
})

defineEmits(['select'])

const { state } = useMessengerStore()
const wallet = useWallet()

const memberStatus = computed(
  () =>
    state.ownChannels.find(ch => ch.pubkey === props.pubkey.toBase58())
      ?.status,
)
const isPending = computed(() => memberStatus.value === 1)
const initials = computed(() => props.channel.name.slice(0, 2))

const isPublicChannel = computed(() => props.channel.flags === 1)

const walletAddress = computed(() => wallet.publicKey.value?.toBase58() ?? '')
const isChannelCreator = computed(() => props.channel.creator.toBase58() === walletAddress.value)
</script>

<template>
  <q-item
    active-class="bg-blue-grey-8 text-white"
    style="min-height: 60px"
    :active="isActive"
  >
    <q-item-section class="chat-item cursor-pointer" @click="$emit('select')">
      <div class="chat-badge" :style="getBadgeColor(`${pubkey}`)">
        <span>{{ initials }}</span>
      </div>
      <div class="chat-name">
        {{ channel.name }}
      </div>

      <div v-if="isChannelCreator" class="message-owner row">
        <custom-tooltip text="Channel Owner" />
        <img src="@/assets/img/star.svg">
      </div>
      <div v-if="isPublicChannel" class="message-public">
        <custom-tooltip text="Public Channel" />
        P
      </div>
      <div v-if="isPending" class="pending-icon">
        <custom-tooltip
          text="Waiting for confirmation"
        />
        <q-spinner-clock color="primary" size="16px" />
      </div>
    </q-item-section>
  </q-item>
</template>

<style scoped lang="scss">
.public-tooltip {
  border-radius: 0 !important;
}
.chat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
}
.chat-badge {
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;

  span {
    text-transform: uppercase;
    font-size: 11px;
    line-height: 13px;
    color: #fff;
  }
}

.chat-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
  margin: 0 10px;
}
.message-public {
  background: #00a57d;
  color: #fff;
  font-size: 10px;
  line-height: 11px;
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.message-owner {
  width: 18px;
  height: 18px;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>
