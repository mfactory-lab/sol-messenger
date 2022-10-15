<script lang="ts" setup>
const { state, postMessage } = useMessengerStore()

const form = reactive({
  message: '',
})

function send() {
  postMessage(form.message)
}

const user = { uid: 1 }

const chats = [
  {
    id: 1,
    uid: 1,
    user: 'me',
    text: 'me',
  },
  {
    id: 2,
    uid: 2,
    user: 'Jane',
    text: 'me',
  },
  {
    id: 3,
    uid: 3,
    user: 'Alex',
    text: 'Lorem ipsum...',
  },
  {
    id: 3,
    uid: 3,
    user: 'Alex',
    text: 'Lorem ipsum...',
  },
  {
    id: 3,
    uid: 3,
    user: 'Alex',
    text: 'Lorem ipsum...',
  },
  {
    id: 3,
    uid: 3,
    user: 'Alex',
    text: 'Lorem ipsum...',
  },
]
</script>

<template>
  <q-card class="messenger-card overflow-hidden">
    <div class="row justify-center">
      <div style="width: 100%; max-width: 600px;max-height: 400px; padding: 20px 30px;" class="scroll-y">
        <q-chat-message
          v-for="chat in chats"
          :key="chat.id"
          :name="chat.user"
          :text="[chat.text]"
          :sent="chat.uid === user.uid"
        />
      </div>
    </div>

    <q-form @submit.prevent="send">
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
        />
        <q-btn rounded flat type="submit">
          Send
        </q-btn>
      </q-toolbar>
    </q-form>
  </q-card>
</template>

<style lang="scss" scoped>
.messenger-card {
  max-width: 500px;
  margin: 0 auto;
}
</style>
