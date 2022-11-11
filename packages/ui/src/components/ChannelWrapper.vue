<script lang="ts" setup>
const props = defineProps({
  channel: { type: Object },
  messages: { type: Array },
  postMessageState: { type: Object },
  isSomeoneMessage: { type: Function, default: () => false },
  allowSend: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  channelLoadingState: { type: Boolean, default: false },
})

const emit = defineEmits(['sendMessage'])

const sendMessage = (message: any) => emit('sendMessage', message)
</script>

<template>
  <q-card class="messenger-card" square>
    <div class="messenger-content">
      <div v-if="channel" class="row justify-center channel-wrapper">
        <div v-if="messages.length > 0" class="messenger-messages">
          <q-chat-message
            v-for="msg in messages.concat(messages)"
            :key="msg.id"
            :name="msg.senderFormatted"
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
      :sending="loading"
      :disabled="!allowSend"
      @submit="sendMessage"
    />
    <q-inner-loading :showing="channelLoadingState" />
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
    max-height: 400px;
    padding: 20px 0 20px 30px;
    overflow: hidden;
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
