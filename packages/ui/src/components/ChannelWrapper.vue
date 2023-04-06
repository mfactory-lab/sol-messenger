<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core'
import { useWallet } from 'solana-wallets-vue'
import type { PropType } from 'vue'
import type { MessageState } from '@/store/messenger'

const messageProps = defineProps({
  postMessageState: {
    type: Object as PropType<MessageState>,
    required: true,
  },
})
const emit = defineEmits(['sendMessage', 'deleteMessage'])

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
      data[i - 1].text.push(`<div data-id='${msg.id}'>${msg.content}</div>`)
    } else {
      prev = msg.sender
      const sender = state.channelMembers.find(
        m => m.data.authority.toBase58() === prev.toBase58(),
      )
      data.push({
        id: msg.id,
        sender: msg.sender,
        senderDisplayName:
          sender?.data.name !== '' && !channel.isPublicChannel
            ? sender?.data.name
            : msg.senderDisplayName,
        text: [`<div data-id='${msg.id}'>${msg.content}</div>`],
        date: msg.createdAt,
      })
      i++
    }
  }
  return data
})

const isAllowSend = computed(() => channel.canPostMessage)

const sendMessage = (message: any) => emit('sendMessage', message)

const handleEditMessage = (msg: any) => {
  messageProps.postMessageState!.message = msg.text
  messageProps.postMessageState!.edit = true
  messageProps.postMessageState!.messageId = msg.messageId
}

const handleDeleteMessage = (messageId: number) => {
  emit('deleteMessage', messageId)
}

const chat = ref<HTMLElement>()
const mes = ref<HTMLElement>()

watch(mes, (c) => {
  if (c) {
    chat.value!.scrollTop = c.scrollHeight
  }
})

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
            :key="Number(msg.id)"
            text-html
            :name="msg.senderDisplayName"
            :sent="isSomeoneMessage(msg.sender)"
            :class="!isSomeoneMessage(msg.sender) ? 'sender' : 'others'"
          >
            <div v-for="(text, j) in msg.text" :key="j" class="message">
              <channel-message
                :text="text"
                :sender="!!isSomeoneMessage(msg.sender)"
                @handle-edit="handleEditMessage"
                @handle-delete="handleDeleteMessage"
              />
            </div>
          </q-chat-message>
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
      :message="postMessageState"
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

.message {
  &:hover {
    .message-actions {
      opacity: 1;
    }
  }
  &-wrapper {
    padding: 15px 17px 15px 12px;
  }
  &-actions {
    opacity: 0;
    position: absolute;
    top: 2px;
    right: 2px;
    cursor: pointer;
    transition: 0.3s;

    svg {
      opacity: 0.6;
      transition: 0.3s;

      &:hover {
        opacity: 1;
      }
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
    padding: 0;
    &:last-child {
      display: flex;
      align-items: center;
      min-height: auto;
    }
  }
}

.sender {
  .q-message-text--received {
    color: $primary;
    width: fit-content;
  }
  .q-message-text-content--received {
    color: #fff;
    width: 100%;
    height: 100%;
  }
}

.others {
  .q-message-text--sent {
    color: $secondary;
  }
}
</style>
