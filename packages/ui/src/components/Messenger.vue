<script lang="ts" setup>
import { useWallet } from 'solana-wallets-vue'
import DebugBtn from '@/components/DebugBtn.vue'
import type { AllChannels } from '@/store/messenger'

const wallet = useWallet()

const { state, postMessage, loadChannel, refreshList, channelAuthorityDevice }
  = useMessengerStore()
const channel = useChannelStore()
const mobileStore = useMobileStore()

const newChannel = useChannelCreate()
const joinChannel = useChannelJoin()
const addMember = useChannelAddMember()
const authorizeMember = useChannelAuthorizeMember()
const deleteMember = useChannelDeleteMember()
const deleteChannel = useChannelDelete()
const leaveChannel = useChannelLeave()

const postMessageState = reactive({ message: '' })
const allChannels = computed(() => state.allChannels)
const searchChannels = ref<AllChannels[]>([])
const searchWord = ref('')

async function sendMessage(message: any) {
  await postMessage(message.value)
  postMessageState.message = ''
}

const onSearch = (val: string) => {
  if (val === '') {
    searchChannels.value = []
    searchWord.value = ''
    return
  }
  searchChannels.value = channel.ownChannels.filter(
    (ch: any) =>
      ch.data.name.toLocaleLowerCase().includes(val.toLocaleLowerCase())
      || ch.pubkey.toBase58().toLocaleLowerCase().includes(val.toLocaleLowerCase()),
  )
  searchWord.value = val
}

const isLoading = computed(() => state.loading)

const showDeviceKeyDialog = ref<Boolean>(false)

const filterChannels = computed(() =>
  searchChannels.value.length > 0 || searchWord.value.length > 0
    ? searchChannels.value
    : channel.ownChannels,
)

const handleAddMember = (val: any) => addMember.submit(val)

const handleJoinToChannel = (name: string) => {
  joinChannel.state.name = name
  joinChannel.submit()
}

const isMobileMessages = computed(() => {
  if (!mobileStore.isMobile) {
    return 1
  }
  return mobileStore.state.searchOrInfo === 'search' ? 1 : 2
})

const authorityDevice = ref<string | undefined>('')

watch(() => state.memberDevices, async (d) => {
  if (d.length > 0) {
    authorityDevice.value = await channelAuthorityDevice()
  }
})
</script>

<template>
  <div class="messenger-wrapper">
    <messenger-toolbar
      @search="onSearch"
      @show-members="authorizeMember.state.dialog = true"
      @delete-channel="deleteChannel.submit(state.channelAddr)"
      @leave-channel="leaveChannel.submit(state.channelAddr)"
      @add-member="addMember.state.dialog = true"
      @show-device-key="showDeviceKeyDialog = true"
    />
    <div class="messenger-main">
      <q-card class="messenger-channels" square flat>
        <template v-if="filterChannels.length > 0">
          <q-list separator class="channels-list">
            <messenger-channel
              v-for="ch in filterChannels"
              :key="ch.name"
              :pubkey="ch.pubkey"
              :channel="ch.data"
              active-class="select-channel"
              :is-active="`${state.channelAddr}` === `${ch.pubkey}`"
              @select="loadChannel(ch.pubkey)"
            />
          </q-list>
        </template>
        <div v-else class="messenger-channels-empty">
          No channels
        </div>
        <channel-control
          :is-joining="joinChannel.state.loading"
          :is-loading="isLoading"
          @create-channel="newChannel.state.dialog = true"
          @join-channel="joinChannel.state.dialog = true"
          @refresh-list="refreshList"
        />
      </q-card>
      <channel-wrapper
        :style="{ 'z-index': isMobileMessages }"
        :post-message-state="postMessageState"
        @send-message="sendMessage"
      />
      <q-inner-loading :showing="state.loading" color="primary" />
    </div>
  </div>

  <new-channel-dialog
    v-model="newChannel.state.dialog"
    :loading="newChannel.state.loading"
    :default-state="newChannel.state"
    @submit="newChannel.submit"
    @reset="newChannel.reset"
  />

  <add-member-dialog
    v-model="addMember.state.dialog"
    :loading="addMember.state.loading"
    :default-state="addMember.state"
    @submit="handleAddMember"
    @reset="addMember.reset"
  />

  <join-channel-dialog
    v-model="joinChannel.state.dialog"
    :loading="joinChannel.state.loading"
    :default-state="joinChannel.state"
    @submit="handleJoinToChannel"
    @reset="joinChannel.reset"
  />

  <member-list-dialog
    v-model="authorizeMember.state.dialog"
    :wallet="wallet"
    :authorize-member-state="authorizeMember.state"
    :delete-member-state="deleteMember.state"
    @submit="authorizeMember.submit"
    @delete-member="deleteMember.submit"
  />

  <user-info-dialog
    v-model="showDeviceKeyDialog"
    :devices="state.memberDevices"
    :authority-device="authorityDevice"
    @load-channel="loadChannel(state.channelAddr)"
  />

  <div v-if="state.channel" class="q-my-md q-px-lg">
    <debug-btn />
  </div>
</template>

<style lang="scss">
.messenger-wrapper {
  max-width: 750px;
  margin: 0 auto;

  .messenger-main {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 400px;

    @media (max-width: $breakpoint-xs) {
      min-height: 444px;
    }

    .messenger-card {
      flex: 1;
    }
  }
}
.messenger {
  max-width: 800px;
  margin: 0 auto;
}

.messenger-card {
  margin: 0 auto;

  @media (max-width: $breakpoint-xs) {
    position: absolute !important;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
}
.messenger-channels-empty {
  flex: 1;
  height: 100%;
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

.messenger-add-channel {
  margin: 0 0 1rem;
  .q-btn {
    //display: block;
    width: 100%;
  }
}

.messenger-channels {
  overflow: hidden;
  position: relative;
  padding: 0;
  border-radius: 0;
  width: 220px;
  display: flex;
  flex-direction: column;
  background: #fdfcfc !important;
  border-right: 0.5px solid #cecece;

  @media (max-width: $breakpoint-xs) {
    width: 100%;
    position: absolute !important;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
  }

  .channels-list {
    flex: 1;
    overflow-y: auto;
  }
  &-empty {
    min-height: 100px;
    color: #aaa;
    display: flex;
    text-align: center;
    align-content: center;
    align-items: center;
    justify-content: center;
  }
}

.channel-name {
  text-align: right;
  font-size: 30px;
  line-height: 1;
  margin: 0 0 1.5rem;
  font-weight: 900;
  color: $primary;
}

.memberlist {
  &-item {
    padding: 16px;

    @media (max-width: $breakpoint-xs) {
      padding: 16px 0;
    }
  }

  &-card {
    @media (max-width: $breakpoint-xs) {
      padding: 0;
    }
  }

  &-status {
    text-transform: uppercase;
    width: 66px;
    justify-content: center;
    margin-right: 15px;
  }

  &-info {
    max-width: 85%;

    &__details {
      display: flex;
      gap: 10px;
      padding-right: 10px;

      span {
        &:first-child {
          min-width: 65px;
          width: 15%;
          border-right: 1px solid rgb(69 90 100 / 30%);
        }

        &:last-child {
          width: 85%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: $gray-blue;
          /* border-right: 1px solid rgb(69 90 100 / 30%); */
        }
      }
    }
  }

  &-btns {
    display: none;
    position: relative;

    &::before {
      content: "";
      height: 29px;
      width: 1px;
      background: rgb(69 90 100 / 30%);
      position: absolute;
      left: 0px;
    }

    &:has(button) {
      display: flex;
      flex-direction: column;
      justify-content: end;
      gap: 5px;
      padding-left: 15px;
    }

    button {
      border-radius: 0;
      width: 75px !important;
      text-transform: capitalize;

      span {
        font-size: 11px;
      }
    }
  }

  .q-dialog__inner--minimized {
    padding: 15px;
  }

  .authorized {
    background: #00a57d;
    font-size: 11px;
    text-transform: capitalize;
  }

  .pending {
    background: $secondary;
    color: #fff;
    font-size: 11px;
    text-transform: capitalize;
  }
}

.select-channel {
  background: $primary;

  .chat-name {
    color: #fff;
  }

  .q-spinner {
    color: #fff !important;
  }
}
.owner {
  background: #e0f2f1;
}
</style>
