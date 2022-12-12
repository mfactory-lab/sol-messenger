<script lang="ts" setup>
import type { PublicKey } from '@solana/web3.js'
import { useDebounceFn } from '@vueuse/core'
import { useWallet } from 'solana-wallets-vue'

defineProps({
  postMessageState: { type: Object },
})

const emit = defineEmits(['sendMessage'])

const wallet = useWallet()
const { state } = useMessengerStore()
const channel = useChannelStore()

function isSomeoneMessage(sender: any) {
  const pubkey = wallet.publicKey.value
  if (!pubkey) {
    return true
  }
  return String(pubkey) !== String(sender)
}

// TODO refactory
const filterDuplicateMessages = computed(() => [
  ...new Map(
    state.channelMessages.map(item => [
      (item.id = Number(item.id.toString())),
      item,
    ]),
  ).values(),
])

const messages = computed(() => {
  const data = []
  let i = 0
  let prev: any
  for (const msg of filterDuplicateMessages.value) {
    if (prev && `${msg.sender}` === `${prev}`) {
      data[i - 1].text.push(msg.content)
    } else {
      prev = msg.sender
      const sender = state.channelMembers.find(
        m => m.data.authority.toBase58() === prev.toBase58(),
      )
      data.push({
        id: msg.id,
        sender: msg.sender,
        senderDisplayName:
          sender?.data.name !== '' && !channel.isPublicChannel ? sender?.data.name : msg.senderDisplayName,
        text: [msg.content],
        date: msg.createdAt,
      })
      i++
    }
  }
  return data
})

const isAllowSend = computed(() => channel.canPostMessage)

const sendMessage = (message: any) => emit('sendMessage', message)

const chat = ref<HTMLElement>()
const mes = ref<HTMLElement>()

watch(mes, (c) => {
  if (c) {
    chat.value!.scrollTop = c.scrollHeight
  }
})

let showScrollTimer: any

const isScroll = ref(false)

const debouncedFn = useDebounceFn(() => {
  isScroll.value = false
}, 2000)

const handleScrollbar = (e: any, hide?: boolean, scroll?: boolean) => {
  if (hide) {
    isScroll.value = false
    return
  }

  if (scroll) {
    isScroll.value = true
    debouncedFn()
    return
  }
  isScroll.value = true
  debouncedFn()
}
</script>

<template>
  <q-card
    class="messenger-card"
    :class="{ 'show-scroll': isScroll }"
    square
    flat
  >
    <div class="messenger-content">
      <div v-if="channel.isChannelLoading" class="preloader">
        <q-spinner-hourglass color="primary" size="2em" />
      </div>

      <div
        v-else-if="state.channel"
        ref="chat"
        class="row justify-center channel-wrapper"
        @mouseenter="handleScrollbar"
        @mouseleave="(e) => handleScrollbar(e, true)"
        @scroll="(e) => handleScrollbar(e, false, true)"
      >
        <div v-if="messages.length > 0" ref="mes" class="messenger-messages">
          <q-chat-message
            v-for="msg in messages"
            :key="msg.id"
            :name="msg.senderDisplayName"
            :text="msg.text"
            :sent="isSomeoneMessage(msg.sender)"
            :class="!isSomeoneMessage(msg.sender) ? 'sender' : 'others'"
          />
        </div>
        <div v-else class="messenger-empty">
          No messages
        </div>
      </div>

      <div v-else-if="!channel.isWalletConnected" class="messenger-empty">
        <img src="@/assets/img/solana-logo.svg" alt="logo">
        <span name="connect">Please connect a wallet</span>
      </div>

      <div v-else class="messenger-empty">
        <span name="select">Please select a channel</span>
      </div>
    </div>

    <channel-form
      :message="postMessageState.message"
      :sending="channel.isSendMessage"
      :disabled="!isAllowSend"
      @submit="sendMessage"
    />
  </q-card>
</template>

<style lang="scss">
.channel-wrapper {
  height: 100%;
  overflow: overlay;
}

.messenger-card {
  display: flex;
  flex-direction: column;

  .messenger-content {
    flex: 1;
  }

  .messenger-messages {
    width: 100%;
    padding: 20px;
    min-height: 200px;
  }

  /*
* SCROLLBAR
*/
  ::-webkit-scrollbar {
    width: 0;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #e4edff63;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #6c6c6c29;
  }

  .messenger-empty {
    padding: 2rem;
    color: #aaa;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    height: 100%;

    img {
      width: 143px;
      height: 143px;
      object-fit: contain;
    }

    span[name="connect"] {
      font-size: 15px;
      line-height: 18px;
      text-transform: uppercase;
      color: #ff5c5c;
    }
  }
}

.messenger-card.show-scroll {
  ::-webkit-scrollbar {
    width: 3px;
  }
}

.preloader {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sender,
.others {
  .q-message-text {
    padding: 10px 12px;
  }
}

.sender {
  .q-message-text {
    padding: 10px 12px;
  }
  .q-message-text--received {
    color: $primary;
  }
  .q-message-text-content--received {
    color: #fff;
  }
}

.others {
  .q-message-text--sent {
    color: $secondary;
  }
}
</style>
