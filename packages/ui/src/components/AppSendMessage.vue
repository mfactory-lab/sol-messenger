<script lang="ts" setup>
const emit = defineEmits(['sendMessage',])

const props = defineProps({
  message: {type: String, default: ''},
  allowSend: { type: Boolean, default: false },
  sendingState: { type: Boolean, default: false }
})

const sendMessage = (message: string) => emit('sendMessage', message)
</script>
<template>
  <q-form class="channel-form" @submit.prevent="sendMessage(message)">
    <q-toolbar class="row message-control">
      <q-input
        ref="inputFocus"
        v-model="message"
        class="col-grow message-input"
        bg-color="white"
        placeholder="Type a message"
        dense
        borderless
        autofocus
        :disable="!allowSend && false"
      />
      <q-btn class="send-btn" square flat type="submit" :disable="!allowSend && false" :loading="sendingState">
        Send
      </q-btn>
    </q-toolbar>
  </q-form>
</template>
<style lang="scss" scoped>
.message-control {
  background: #f2f2f2;
  padding: 8px;
  align-items: stretch;
  gap: 8px;
  .message-input {
    border: 1px solid #DADADA;
    background: #fff;
    padding: 0 8px;
  }

  .send-btn {
    background: #FFD140;
    color: #455A64;
  }
}
</style>
