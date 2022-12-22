<script setup lang="ts">
import type { PropType } from 'vue'
import { useQuasar } from 'quasar'
import { DEFAULT_MAX_MESSAGES } from '../../hooks/messenger'
import type { useChannelCreate } from '@/hooks/messenger'
import { CHANNEL_INFO, CHANNEL_INPUT_MAX_LENGTH, CHANNEL_MAX_MESSAGES } from '@/config'

type State = Omit<
  ReturnType<typeof useChannelCreate>['state'],
  'loading' | 'dialog'
>

const props = defineProps({
  loading: { type: Boolean, default: false },
  defaultState: Object as PropType<State>,
})

const emit = defineEmits(['submit', 'reset'])

const { notify } = useQuasar()
const { error, noSol } = useHelper()

const { channelMessagesCost } = useMessengerStore()
const userStore = useUserStore()

const state = ref(props.defaultState)

const messagesCost = ref<string | number>(0)

const createNewChannel = () => {
  if (messagesCost.value > userStore.balance) {
    if (!userStore.isUserHaveSol) {
      noSol()
    }
    return error('You don\'t have enough SOL')
  }
  emit('submit', state)
}

const messagesCostFormat = computed(() => {
  return messagesCost.value !== 'extra'
    ? `~${Number(messagesCost.value).toFixed(5)} SOL`
    : 'Limit exceeded'
})

watch(
  () => state.value?.maxMessages,
  async (m) => {
    const cost = await channelMessagesCost(Number(m))
    messagesCost.value = cost
  },
)

const chechNicknameLength = (val: string) => {
  if (val === '') {
    return true
  }
  return val !== '' && val.length <= 25
}

onMounted(async () => {
  const maxMessages = DEFAULT_MAX_MESSAGES
  messagesCost.value = await channelMessagesCost(Number(maxMessages))
})
</script>

<template>
  <q-dialog class="new-channel-dialog" @hide="$emit('reset')">
    <q-card square flat>
      <q-card-section>
        <q-form class="messenger-new-channel-form" @submit="createNewChannel">
          <q-input
            v-model="state.name"
            label="Channel name *"
            lazy-rules
            :maxlength="CHANNEL_INPUT_MAX_LENGTH"
            :rules="[
              (val) => (val && val.length > 2) || 'Please type something',
              (val) => (val && val.length <= 25) || 'Please use maximum 25 characters',
            ]"
          />
          <q-input
            v-model="state.memberName"
            label="Member name"
            lazy-rules
            :maxlength="CHANNEL_INPUT_MAX_LENGTH"
            :rules="[
              (val) => (chechNicknameLength(val)) || 'Please use maximum 25 characters',
            ]"
          >
            <div class="toggle-info max-messages-tooltip">
              <custom-tooltip :text="CHANNEL_INFO[3]" padding="8px" />
              <img src="@/assets/img/info.svg" alt="info">
            </div>
          </q-input>
          <div class="relative-position">
            <q-input
              v-model="state.maxMessages"
              label="Max messages"
              lazy-rules
              type="number"
              debounce="200"
              :rules="[(val) => +val > 0 || 'Invalid value',
                       (val) => +val < CHANNEL_MAX_MESSAGES + 1 || 'Max messages 20000']"
            />
            <div class="messages-cost">
              {{ messagesCostFormat }}
            </div>
            <div class="toggle-info max-messages-tooltip">
              <custom-tooltip :text="CHANNEL_INFO[2]" padding="8px" />
              <img src="@/assets/img/info.svg" alt="info">
            </div>
          </div>
          <div class="row q-mt-md relative-position" style="height: 42px">
            <div class="toggle-info">
              <custom-tooltip :text="CHANNEL_INFO[0]" padding="8px" />
              <img src="@/assets/img/info.svg" alt="info">
            </div>
            <div
              class="col text-primary"
              :class="{ 'toggle-border': !state.public }"
            >
              Private<q-toggle v-model="state.public" label="Public" />
            </div>
            <div v-if="!state.public" class="row text-primary toggle-approve">
              <q-toggle v-model="state.permissionless" />
              <span>
                <div class="toggle-info">
                  <custom-tooltip :text="CHANNEL_INFO[1]" padding="8px" />
                  <img src="@/assets/img/info.svg" alt="info">
                </div>
                Members can approve</span>
            </div>
          </div>
          <q-btn
            type="submit"
            class="dialog-submit-btn q-mt-md"
            text-color="black"
            :ripple="false"
            square
            flat
          >
            Create the Channel
          </q-btn>
        </q-form>
        <q-inner-loading :showing="loading" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
.new-channel-dialog {
  .q-card {
    width: 320px;
  }
}

.q-toggle__label .q-anchor--skip {
  display: none !important;
}

.toggle {
  &-border {
    border-right: 1px solid #455a645c;
  }

  &-info {
    position: absolute;
    top: -15px;
    cursor: pointer;
  }

  &-approve {
    width: 140px;
    align-items: center;

    span {
      width: 58%;
      line-height: 15px;
    }
  }
}

.messages-cost {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  opacity: 0.7;
}

.max-messages-tooltip {
  top: 10px;
  left: 110px;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
