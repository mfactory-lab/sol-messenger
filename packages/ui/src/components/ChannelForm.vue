<script lang="ts" setup>
const props = defineProps({
  message: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  sending: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const message = ref(props.message)

const sendMessage = () => {
  emit('submit', message)
  message.value = ''
}
</script>

<template>
  <q-form class="channel-form" @submit.prevent="sendMessage">
    <q-toolbar class="row message-control">
      <q-input
        ref="inputFocus"
        v-model="message"
        class="col-grow message-input"
        placeholder="Type a message"
        dense
        borderless
        autofocus
        :disable="disabled"
      />
      <q-btn class="send-btn" square flat type="submit" :disable="disabled" :loading="sending">
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
