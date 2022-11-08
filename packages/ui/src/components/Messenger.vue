<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'

const { notify } = useQuasar()
const wallet = useWallet()

const { state, postMessage, loadChannel } = useMessengerStore()
const { isWalletConnected, isAuthorizedMember, isPendingMember, messages, allowSend, canJoinChannel } = useChannel()
const newChannel = useChannelCreate()
const joinChannel = useChannelJoin()
const addMember = useChannelAddMember()
const authorizeMember = useChannelAuthorizeMember()
const deleteMember = useChannelDeleteMember()

const postMessageState = reactive({
  message: '',
})

async function sendMessage() {
  await postMessage(postMessageState.message)
  postMessageState.message = ''
}

async function selectChannel(addr: any) {
  await loadChannel(addr)
}

function isSomeoneMessage(sender: any) {
  const pubkey = wallet.publicKey.value
  if (!pubkey) {
    return true
  }
  return String(pubkey) !== String(sender)
}

const channelFilter = reactive({ text: '' })

const onSearch = (val: string) => {
  channelFilter.text = val
}

const filteredChannels = computed(() => {
  return state.allChannels.filter((channel: any) => channel.data.name.includes(channelFilter.text))
})

const showMembersDialog = () => {
  authorizeMember.state.dialog = true
}
</script>

<template>
  <div class="messenger-wrapper">
    <messenger-toolbar
      @search="onSearch"
      @show-members="showMembersDialog"
      @delete-channel="deleteMember.submit(state.channelAddr)"
      @add-member="addMember.state.dialog = true"
    />
    <div class="messenger-main">
      <q-card class="messenger-channels">
        <template v-if="filteredChannels.length > 0">
          <q-list separator class="channels-list">
            <messenger-channel
              v-for="ch in filteredChannels" :key="ch.name"
              :channel="ch"
              :state="state"
              @select-channel="selectChannel(ch.pubkey)"
            />
          </q-list>
        </template>
        <div v-else class="messenger-channels-empty">
          No channels
        </div>
        <q-inner-loading :showing="state.loading" color="primary" />
        <channel-control
          :can-join-channel="canJoinChannel"
          :is-authorized-member="isAuthorizedMember"
          :is-pending-member="isPendingMember"
          :is-wallet-connected="isWalletConnected"
          @create-channel="newChannel.state.dialog = true"
          @join-channel="joinChannel.state.dialog = true"
        />
      </q-card>
      <channel-wrapper
        :channel="state.channel"
        :allow-send="allowSend"
        :channel-loading-state="state.channelLoading"
        :is-someone-message="isSomeoneMessage"
        :messages="messages"
        :post-message-state="postMessageState"
        :sending-state="state.sending"
        @send-message="sendMessage"
      />
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
    @submit="addMember.submit"
    @reset="addMember.reset"
  />

  <join-channel-dialog
    v-model="joinChannel.state.dialog"
    :loading="joinChannel.state.loading"
    :default-state="joinChannel.state"
    @submit="joinChannel.submit"
    @reset="joinChannel.reset"
  />

  <member-list-dialog
    v-model="authorizeMember.state.dialog"
    :is-authorized-member="isAuthorizedMember"
    :wallet="wallet"
    :authorize-member-state="authorizeMember.state"
    :delete-member-state="deleteMember.state"
    @submit="authorizeMember.submit"
    @delete-member="deleteMember.submit"
  />
</template>

<style lang="scss" scoped>
.messenger-wrapper {
  max-width: 800px;
  margin: 0 auto;

  .messenger-main {
    display: flex;
    flex-direction: row;
    height: 400px;

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
}
.messenger-channels-empty {
  flex: 1;
  height: 100%;
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
  max-width: 170px;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #FDFCFC;

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
  color: $primary
}
</style>
