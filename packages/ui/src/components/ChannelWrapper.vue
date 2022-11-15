<script lang="ts" setup>
import { useWallet } from 'solana-wallets-vue'

defineProps({
  postMessageState: { type: Object },
})

const emit = defineEmits(['sendMessage'])

const wallet = useWallet()
const { state } = useMessengerStore()
const { isChannelLoading, isSendMessage } = useChannelStore()

function isSomeoneMessage(sender: any) {
  const pubkey = wallet.publicKey.value
  if (!pubkey) {
    return true
  }
  return String(pubkey) !== String(sender)
}

const messages = computed(() => {
  const data = []
  let i = 0; let prev
  for (const msg of state.channelMessages) {
    if (prev && `${msg.sender}` === `${prev}`) {
      data[i - 1].text.push(msg.content)
    } else {
      prev = msg.sender
      data.push({
        id: msg.id,
        sender: msg.sender,
        senderDisplayName: msg.senderDisplayName,
        text: [msg.content],
        date: msg.createdAt,
      })
      i++
    }
  }
  return data
})

const isAllowSend = computed(() => state.channelAddr)

const sendMessage = (message: any) => emit('sendMessage', message)

const chat = ref<HTMLElement>()
const mes = ref<HTMLElement>()

watch(mes, (c) => {
  if (c) {
    chat.value!.scrollTop = c.scrollHeight
  }
})
</script>

<template>
  <q-card class="messenger-card" square>
    <div ref="chat" class="messenger-content">
      <div v-if="state.channel" class="row justify-center channel-wrapper">
        <div v-if="messages.length > 0" ref="mes" class="messenger-messages">
          <q-chat-message
            v-for="msg in messages"
            :key="msg.id"
            :name="msg.senderDisplayName"
            :text="msg.text"
            :sent="isSomeoneMessage(msg.sender)"
          />
        </div>
        <div v-else class="messenger-empty">
          No messages
        </div>
      </div>
      <div v-else class="messenger-empty">
        Please select a channel
      </div>
    </div>

    <channel-form
      :message="postMessageState.message"
      :sending="isSendMessage"
      :disabled="!isAllowSend"
      @submit="sendMessage"
    />
    <q-inner-loading :showing="isChannelLoading" />
  </q-card>
</template>

<style lang="scss" scoped>
.messenger-card {
  display: flex;
  flex-direction: column;

  .messenger-content {
    flex: 1;
    overflow-y: auto;

    .channel-wrapper {
      height: 100%;
    }
  }

  .messenger-messages {
    width: 100%;
    max-width: 600px;
    padding: 20px 10px 20px 15px;
    min-height: 200px;
  }

  .messenger-empty {
    padding: 2rem;
    color: #aaa;
    min-height: 200px;
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
}
</style>
