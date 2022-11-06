<script lang="ts" setup>
import AppSendMessage from "@/components/AppSendMessage.vue";

const emit = defineEmits(['sendMessage',])

const props = defineProps({
  channel: {type: Object, default: {}},
  messages: {type: Array, default: []},
  postMessageState: {type: Object, default: {message: ''}},
  isSomeoneMessage: {type: Function, default: () => false},
  allowSend: {type: Boolean, default: false},
  sendingState: {type: Boolean, default: false},
  channelLoadingState: {type: Boolean, default: false}
});

const sendMessage = (message: any) => emit('sendMessage', message);
</script>

<template>
  <q-card class="messenger-card overflow-hidden" square>
    <div class="messenger-content">
      <div v-if="channel" class="row justify-center channel-wrapper">
        <div v-if="messages.length > 0" class="messenger-messages">
          <q-chat-message
            v-for="msg in messages"
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

    <app-send-message
      @sendMessage="sendMessage"
      :message="postMessageState.message"
      :sending-state="sendingState"
      :allow-send="allowSend"
    ></app-send-message>
    <q-inner-loading :showing="channelLoadingState"/>
  </q-card>
</template>
<style lang="scss" scoped>
.messenger-card {
  display: flex;
  flex-direction: column;

  .messenger-content {
    flex: 1;

    .channel-wrapper {
      height: 100%;
    }
  }

  .messenger-messages {
    width: 100%;
    max-width: 600px;
    max-height: 400px;
    padding: 20px 30px;
    overflow-y: auto;
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
  }
}
</style>
