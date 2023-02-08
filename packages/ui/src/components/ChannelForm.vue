<script lang="ts" setup>
import { useQuasar } from 'quasar'

const props = defineProps({
  message: { type: Object },
  disabled: { type: Boolean, default: false },
  sending: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const { notify } = useQuasar()

const sendMessage = () => {
  emit('submit')
  props.message!.message = ''
}

let timer: any
let countDowm = 59

const stopInterval = () => {
  clearInterval(timer)
}

const showNotif = () => {
  const notif = notify({
    group: false,
    timeout: 0,
    classes: 'expires-notofocation',
    message: 'Transaction expires',
    type: 'warning',
    caption: '9',
  })

  const interval = setInterval(() => {
    notif({
      caption: `${countDowm}`,
    })

    if (countDowm === 0 || countDowm > 10) {
      notif({
        timeout: 100,
        caption: '--',
      })
      clearInterval(interval)
    }
  }, 1000)
}

watch(
  () => props.sending,
  (s) => {
    if (s) {
      timer = setInterval(() => {
        if (countDowm === 0) {
          stopInterval()
          notify({
            timeout: 3000,
            message: 'Transaction expires',
            type: 'negative',
          })
          countDowm = 59
          return
        }
        if (countDowm === 10) {
          showNotif()
        }
        countDowm--
      }, 1000)
    } else {
      stopInterval()
      countDowm = 59
    }
  },
)
</script>

<template>
  <q-form class="channel-form" @submit.prevent="sendMessage">
    <q-toolbar class="row message-control">
      <q-input
        ref="inputFocus"
        v-model="message.message"
        class="col-grow message-input"
        placeholder="Type a message"
        maxlength="201"
        dense
        borderless
        autofocus
        :disable="disabled"
        :rules="[
          (val) => val.length <= 200 || 'Please use maximum 200 characters',
        ]"
      />
      <q-btn
        class="send-btn"
        square
        flat
        type="submit"
        :disable="disabled || !message.message.length"
        :loading="sending"
      >
        Send
      </q-btn>
    </q-toolbar>
  </q-form>
</template>

<style lang="scss" scoped>
.message-control {
  align-items: stretch;
  gap: 8px;
  min-height: 42px;
  padding: 0 10px;

  @media (max-width: $breakpoint-xs) {
    flex-direction: column;
    padding: 0;
  }
  .message-input {
    border: 1px solid #dadada;
    background: #fff;
    padding: 0 8px;

    @media (max-width: $breakpoint-xs) {
      margin: 0 8px;
    }
  }

  .send-btn {
    background: #ffd140;
    color: #455a64;
  }
}
</style>

<style lang='scss'>
.expires-notofocation {
  .q-notification__message {
    display: flex;
    flex-direction: row-reverse;
    gap: 10px;
    align-items: center;
  }

  .q-notification__caption {
    font-weight: 600;
  }
}
</style>
