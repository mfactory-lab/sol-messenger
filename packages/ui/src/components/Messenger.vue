<script lang="ts" setup>
const { state, postMessage } = useMessengerStore()

const form = reactive({
  message: '',
})

function send() {
  postMessage(form.message)
}

const wallet = ''

const messages = computed(() => state.channelMessages)
const allowSend = computed(() => state.channel && !state.sending)
</script>

<template>
  <div class="messenger">
    <div class="row">
      <div class="col col-4">
        <div class="q-mb-lg">
          <q-btn color="primary" rounded>
            Add New Channel
          </q-btn>
        </div>
        <q-card class="messenger-channels">
          ...
        </q-card>
      </div>
      <div class="col">
        <q-card class="messenger-card overflow-hidden">
          <div v-if="state.channel" class="row justify-center">
            <div v-if="messages.length > 0" class="messenger-messages">
              <q-chat-message
                v-for="msg in messages"
                :key="msg.id"
                :name="msg.sender"
                :text="[msg.content]"
                :sent="msg.sender === wallet"
              />
            </div>
            <div v-else class="messenger-empty">
              No messages
            </div>
          </div>
          <div v-else class="messenger-empty">
            Please select a channel
          </div>

          <q-form class="messenger-form" @submit.prevent="send">
            <q-toolbar class="bg-primary text-white row">
              <q-input
                ref="inputFocus"
                v-model="form.message"
                class="col-grow q-mr-sm"
                bg-color="white"
                placeholder="Type a message"
                dense
                outlined
                rounded
                autofocus
                :disable="!state.channel"
              />
              <q-btn rounded flat type="submit" :disable="!allowSend" :loading="state.sending">
                Send
              </q-btn>
            </q-toolbar>
          </q-form>
          <q-inner-loading :showing="state.loading" />
        </q-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.messenger {
  max-width: 800px;
  margin: 0 auto;
}
.messenger-card {
  max-width: 500px;
  margin: 0 auto;
}
.messenger-messages {
  width: 100%;
  max-width: 600px;
  max-height: 400px;
  padding: 20px 30px;
  overflow-y: auto;
}
.messenger-empty {
  text-align: center;
  padding: 2rem;
  color: #aaa;
}
.messenger-channels {
  //
}
.messenger-form {
  // ..
}
</style>
