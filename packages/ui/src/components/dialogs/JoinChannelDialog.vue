<script lang="ts" setup>
import type { PropType } from 'vue'
import type { Channel } from '@app/sdk'
import type { AllChannels } from '../../store/messenger'
import { getBadgeColor } from '@/utils'

const props = defineProps({
  loading: { type: Boolean },
  defaultState: Object as PropType<{ name: any; authority: string }>,
})

const joinEmit = defineEmits(['submit', 'reset'])

const state = ref(props.defaultState)

const { state: channelState, selectChannel } = useMessengerStore()

const isModal = ref(false)

const searchWord = ref('')
const searchChannels = ref<AllChannels[]>([])

const privateChannels = computed(() =>
  channelState.allChannels.filter(ch => ch.data.flags < 1),
)

const initials = (channel: Channel) => channel.name.slice(0, 2)

const search = () => {
  if (searchWord.value === '') {
    searchChannels.value = []
    searchWord.value = ''
    return
  }
  searchChannels.value = privateChannels.value.filter(
    (ch: any) =>
      ch.data.name
        .toLocaleLowerCase()
        .includes(searchWord.value.toLocaleLowerCase())
      || ch.pubkey
        .toBase58()
        .toLocaleLowerCase()
        .includes(searchWord.value.toLocaleLowerCase()),
  )
}

const filterChannels = computed(() =>
  searchWord.value?.length > 0 ? searchChannels.value : privateChannels.value,
)

const joinToChannel = (name: string) => {
  joinEmit('submit', name)
}

watch(searchWord, () => {
  search()
})

watch(() => props.loading, (l) => {
  if (l) {
    isModal.value = false
  }
})
</script>

<template>
  <q-dialog class="join-channel-dialog" @hide="$emit('reset')">
    <q-card square flat>
      <q-card-section class="text-body1 text-blue-grey-8">
        Join channel
      </q-card-section>
      <q-card-section>
        <span class="text-blue-grey-8 q-pb-sm">Search by name or address</span>
        <div class="search-block">
          <q-input
            v-model="searchWord"
            class="input no-margin q-pa-none"
            placeholder="Search ..."
            borderless
            dense
            debounce="300"
          />
        </div>
      </q-card-section>
      <q-card-section>
        <q-list
          v-if="filterChannels.length"
          bordered
          separator
          class="privat-channels"
        >
          <q-item
            v-for="ch in filterChannels"
            :key="ch"
            v-ripple
            active-class="bg-blue-grey-8 text-white"
            class="privat-channels-item"
            :active="`${channelState.channelAddr}` === `${ch.pubkey}`"
            clickable
            @click="selectChannel(ch.pubkey)"
          >
            <div class="chat-avatar" :style="getBadgeColor(`${ch.pubkey}`)">
              <span>{{ initials(ch.data) }}</span>
            </div>
            <q-item-section>
              <span class="channel-info">
                {{ ch.data.name }}
              </span>
              <span class="channel-info">
                {{ ch.pubkey }}
              </span>
            </q-item-section>
          </q-item>
        </q-list>
        <q-item
          v-else
          class="privat-channels justify-center items-center text-blue-grey-5"
        >
          Channels not found
        </q-item>
      </q-card-section>

      <q-item>
        <!--        :loading="isJoining"
          :disable="isPendingMember" -->
        <q-btn
          class="control-button"
          square
          flat
          :disable="!channelState.channelAddr"
          @click="isModal = true"
        >
          <img src="@/assets/img/join.svg" alt="join">
          <custom-tooltip text="Join the channel" />
        </q-btn>

        <join-chennal-modal v-model="isModal" @join="joinToChannel" />
      </q-item>
      <q-inner-loading :showing="loading" />
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.search-block {
  border: 1px solid $primary;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 34px;
  margin-top: 10px;

  .input {
    width: 100%;
  }
}

.privat-channels {
  height: 270px;
  min-width: 410px;
  overflow-y: auto;

  &-item {
    display: flex;
    align-items: center;
    min-height: 20px;
  }
}

.chat-avatar {
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;

  span {
    text-transform: uppercase;
    font-size: 11px;
    line-height: 13px;
    color: #fff;
  }
}

.channel-info {
  line-height: 14px;
  font-size: 12px;
}

.control-button {
  width: 44px;
  height: 44px;
  background: #516670;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  margin-left: auto;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}
</style>
