<script lang="ts" setup>
import type { ChannelMembership } from '@app/sdk'
import { isChannelMembershipStatusPending } from '@app/sdk'
import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'
import { shortenAddress } from '@/utils'
import AppChanelListItem from "@/components/app-chanel-list-item.vue";
const { notify } = useQuasar()
const wallet = useWallet()

const {
  state,
  postMessage,
  addMember, deleteMember, authorizeMember,
  createChannel, loadChannel, deleteChannel, joinChannel,
} = useMessengerStore()
const userStore = useUserStore()

const membersDialog = ref(false)
const showDebug = ref(false)
const toggleDebug = useToggle(showDebug)

const joinChannelState = reactive({
  dialog: false,
  loading: false,
  name: '',
  authority: '',
})

const addMemberState = reactive({
  dialog: false,
  loading: false,
  name: '',
  authority: '',
  key: '',
})

const authorizeMemberState = reactive({
  loading: false,
})

const deleteMemberState = reactive({
  loading: false,
})

const newChannelState = reactive({
  dialog: false,
  name: '',
  maxMessages: 15,
})

const postMessageState = reactive({
  message: '',
})

const isWalletConnected = computed(() => !!wallet.publicKey.value)
const isAuthorizedMember = computed(() => state.channelMembership?.status.__kind === 'Authorized')
const isPendingMember = computed(() => state.channelMembership?.status.__kind === 'Pending')
const isChannelCreator = computed(() => isAuthorizedMember.value
  && state.channel?.creator.toString() === String(wallet.publicKey.value ?? '-'))
const channels = computed(() => state.allChannels)

const messages = computed(() => {
  const data = []
  let i = 0; let prev
  for (const msg of state.channelMessages) {
    if (prev && `${msg.sender}` === `${prev}`) {
      data[i - 1].text.push(msg.content)
    } else {
      prev = msg.sender
      data.push({
        id: msg.id,
        sender: msg.sender,
        senderFormatted: msg.senderFormatted,
        text: [msg.content],
        date: msg.createdAt,
      })
      i++
    }
  }
  return data
})
const currentChanel = computed(() => state.channel)

const allowSend = computed(() => isAuthorizedMember.value && !state.sending)
const canAddMember = computed(() => isAuthorizedMember.value)
const canDeleteMember = (member: any) => computed(() => isChannelCreator.value
  && String(member.key) !== String(userStore.keypair?.publicKey)).value
const canJoinChannel = computed(() => isWalletConnected.value && !state.loading && !isAuthorizedMember.value)

const ok = (message: string) => notify({ type: 'positive', message, timeout: 2000 })
const info = (message: string) => notify({ type: 'info', message, timeout: 2000 })
const error = (message: string) => notify({ type: 'negative', message, timeout: 2000 })

const pendingMemberCount = computed(() => {
  return state.channelMembers.filter(acc => isChannelMembershipStatusPending(acc.data.status)).length
})

async function sendMessage() {
  if (checkWalletConnected()) {
    await postMessage(postMessageState.message)
    postMessageState.message = ''
  }
}

function addNewChannel() {
  if (checkWalletConnected()) {
    newChannelState.dialog = true
  }
}

async function handleNewChannel() {
  if (checkWalletConnected()) {
    try {
      await createChannel(newChannelState.name, newChannelState.maxMessages)
      handleNewChannelReset()
      ok('Channel was created!')
    } catch (e) {
      error('Something went wrong')
      console.log(e)
    }
  }
}

function handleNewChannelReset() {
  newChannelState.dialog = false
  newChannelState.name = ''
  newChannelState.maxMessages = 15
}

async function handleAddMember() {
  addMemberState.loading = true
  if (!state.channelAddr) {
    info('Please select a channel')
    return
  }
  try {
    await addMember(addMemberState.authority, addMemberState.key, addMemberState.name)
    handleAddMemberReset()
    ok('Member was added')
  } catch (e) {
    error('Something went wrong')
    console.log(e)
  } finally {
    addMemberState.loading = false
  }
}

function handleAddMemberReset() {
  addMemberState.loading = false
  addMemberState.name = ''
  addMemberState.authority = ''
  addMemberState.key = ''
}

async function handleDeleteMember(key: any) {
  try {
    deleteMemberState.loading = true
    await deleteMember(key)
    ok('Member was deleted')
  } catch (e) {
    error('Something went wrong')
    console.log(e)
  } finally {
    deleteMemberState.loading = false
  }
}
async function handleAuthorizeMember(key: any) {
  try {
    authorizeMemberState.loading = true
    await authorizeMember(key)
    ok('Member was authorized')
  } catch (e) {
    error('Something went wrong')
    console.log(e)
  } finally {
    authorizeMemberState.loading = false
  }
}

async function handleJoinChannel() {
  if (!state.channelAddr) {
    info('Please select a channel')
    return
  }
  joinChannelState.loading = true
  try {
    await joinChannel(state.channelAddr, joinChannelState.name)
    handleJoinChannelReset()
    ok('Request was sent')
  } catch (e) {
    console.log('Error', e)
    error('Something went wrong')
  } finally {
    joinChannelState.loading = false
  }
}

function handleJoinChannelReset() {
  joinChannelState.loading = false
  joinChannelState.dialog = false
  joinChannelState.name = ''
}

async function handleDeleteChannel() {
  if (!state.channelAddr) {
    info('Please select a channel')
    return
  }
  await deleteChannel(state.channelAddr)
  try {
    await deleteChannel(state.channelAddr)
    ok('Channel was deleted!')
  } catch (e) {
    console.log('Error', e)
    error('Something went wrong')
  } finally {
    joinChannelState.loading = false
  }
}

async function selectChannel(addr: any) {
  membersDialog.value = false; // @todo fix autoopen dialog when switch channel
  await loadChannel(addr)
}

function checkWalletConnected() {
  if (!wallet.publicKey.value) {
    info('Please connect wallet')
    return false
  }
  return true
}

function getStatusColor(status: any) {
  if (status?.__kind === 'Authorized') {
    return 'positive'
  }
  return 'grey'
}

function formatMemberName(member: ChannelMembership) {
  if (member?.name && member.name !== '') {
    return member.name
  }
  return shortenAddress(member.authority)
}

function isSomeoneMessage(sender: any) {
  const pubkey = wallet.publicKey.value
  if (!pubkey) {
    return true
  }
  return String(pubkey) !== String(sender)
}
const channelFilter = reactive({
  text: ''
})
const onSearch = (val: string) => {
  channelFilter.text = val;
}

const filteredChannels = computed(() => {
  return channels.value.filter(channel => channel.data.name.includes(channelFilter.text))
})

const showMembersDialog = () => {
  membersDialog.value = true;
}

</script>

<template>
  <div class="messenger-wrapper">
    <app-messenger-panel
      :current-channel="currentChanel"
      :is-wallet-connected="isWalletConnected"
      @change="onSearch"
      @showMembers="showMembersDialog"
      @deleteChannel="handleDeleteChannel"
      @addMember="addMemberState.dialog = true"
    />
    <div class="messenger-main">
      <q-card class="messenger-channels">
        <template v-if="filteredChannels.length > 0">
          <q-list separator class="channels-list">
          <app-chanel-list-item
            v-for="ch in filteredChannels" :key="ch.name"
            :channel="ch"
            :state="state"
            @selectChannel="selectChannel(ch.pubkey)"
            />
          </q-list>
        </template>
        <div v-else class="messenger-channels-empty">
          No channels
        </div>
        <q-inner-loading :showing="state.loading" color="primary" />
        <app-chat-control
          @createChannel="addNewChannel"
          @joinChannel="joinChannelState.dialog = true"
          :can-join-channel="canJoinChannel"
          :is-authorized-member="isAuthorizedMember"
          :is-pending-member="isPendingMember"
          :is-wallet-connected="isWalletConnected"
        ></app-chat-control>
      </q-card>
      <chat-wrapper
        :channel="state.channel"
        :allow-send="allowSend"
        :channel-loading-state="state.channelLoading"
        :is-someone-message="isSomeoneMessage"
        :messages="messages"
        :post-message-state="postMessageState"
        :sending-state="state.sending"
      ></chat-wrapper>
    </div>
  </div>
  <div class="messenger">
    <div class="row q-gutter-md">
      <div class="col col-3">
        <div class="messenger-add-channel">
          <q-btn color="primary" rounded @click="addNewChannel">
            Add New Channel
          </q-btn>
        </div>
        <q-card class="messenger-channels">
          <template v-if="channels.length > 0">
            <q-list separator>
              <q-item
                v-for="ch in channels" :key="ch.name"
                active-class="bg-blue-grey-1 text-grey-8"
                :active="String(state.channelAddr) === String(ch.pubkey)"
              >
                <q-item-section class="cursor-pointer" @click="selectChannel(ch.pubkey)">
                  <q-item-label>{{ ch.data.name }}</q-item-label>
                  <q-item-label caption lines="2">
                    <div>members: {{ ch.data.memberCount }}</div>
                    <div>messages: {{ ch.data.messageCount }}</div>
                  </q-item-label>
                </q-item-section>

                <!--                <q-item-section side> -->
                <!--                  <q-btn-dropdown v-if="isWalletConnected" unelevated rounded> -->
                <!--                    <q-list> -->
                <!--                      <q-item -->
                <!--                        v-if="String(ch.data.creator) === String(wallet.publicKey.value)" -->
                <!--                        v-close-popup clickable -->
                <!--                        @click="removeChannel(ch.pubkey)" -->
                <!--                      > -->
                <!--                        <q-item-section class="text-negative"> -->
                <!--                          <q-item-label>Delete channel</q-item-label> -->
                <!--                        </q-item-section> -->
                <!--                      </q-item> -->
                <!--                    </q-list> -->
                <!--                  </q-btn-dropdown> -->
                <!--                </q-item-section> -->
              </q-item>
            </q-list>
          </template>
          <div v-else class="messenger-channels-empty">
            No channels
          </div>
          <q-inner-loading :showing="state.loading" color="primary" />
        </q-card>
      </div>
      <div class="col">
        <div v-if="state.channel">
          <div class="row">
            <div class="col">
              <q-btn-group rounded unelevated>
                <q-btn
                  v-if="canAddMember"
                  color="secondary" text-color="dark"
                  :loading="addMemberState.loading"
                  @click="addMemberState.dialog = true"
                >
                  add&nbsp;member
                </q-btn>

                <q-btn
                  v-if="canJoinChannel"
                  color="secondary" text-color="dark"
                  :loading="joinChannelState.loading"
                  :disable="isPendingMember"
                  @click="joinChannelState.dialog = true"
                >
                  {{ isPendingMember ? 'pending&nbsp;access' : 'join&nbsp;channel' }}
                </q-btn>

                <q-btn v-if="isWalletConnected" color="blue-grey" @click="membersDialog = true">
                  members
                  <q-badge v-if="pendingMemberCount > 0" color="info" rounded floating>
                    {{ pendingMemberCount }}
                  </q-badge>
                </q-btn>

                <q-btn v-if="isChannelCreator" color="negative" @click="handleDeleteChannel">
                  delete
                </q-btn>
              </q-btn-group>
            </div>
            <div class="col">
              <div class="channel-name">
                {{ state.channel.name }}
              </div>
            </div>
          </div>
        </div>
        <q-card class="messenger-card overflow-hidden">
          <div v-if="state.channel" class="row justify-center">
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

          <!-- Channel (new message form) -->
          <q-form class="channel-form" @submit.prevent="sendMessage">
            <q-toolbar class="bg-primary text-white row">
              <q-input
                ref="inputFocus"
                v-model="postMessageState.message"
                class="col-grow q-mr-sm"
                bg-color="white"
                placeholder="Type a message"
                dense
                outlined
                rounded
                autofocus
                :disable="!allowSend"
              />
              <q-btn rounded flat type="submit" :disable="!allowSend" :loading="state.sending">
                Send
              </q-btn>
            </q-toolbar>
          </q-form>
          <q-inner-loading :showing="state.channelLoading" />
        </q-card>

        <div v-if="state.channel" class="q-my-md q-px-lg">
          <q-btn flat class="text-blue-2" @click="toggleDebug()">
            debug info
          </q-btn>
          <template v-if="showDebug">
            <div
              v-for="row in [
                ['Authorized', isAuthorizedMember],
                ['Pending Access', isPendingMember],
                ['Channel Creator', isChannelCreator],
                ['Channel', state.channel],
                ['Membership', state.channelMembership],
                ['Members', state.channelMembers],
              ]"
              :key="row[0]" class="row q-mt-md"
            >
              <div class="col col-4">
                {{ row[0] }}
              </div>
              <div class="col">
                <pre class="no-margin">{{ row[1] }}</pre>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- New channel dialog -->
  <new-channel-dialog
    :channel-state="newChannelState"
    :state-creating="state.creating"
    @handleNewChannel="handleNewChannel"
  ></new-channel-dialog>

  <!-- Add member dialog -->
  <add-member-dialog
    :member-state="addMemberState"
    @handleAddMemberReset="handleAddMemberReset"
    @handleAddMember="handleAddMember"
  ></add-member-dialog>

  <!-- Join channel dialog -->
  <join-channel-dialog
    :join-channel-state="joinChannelState"
    @handleJoinChannelReset="handleJoinChannelReset"
    @handleJoinChannel="handleJoinChannel"
  ></join-channel-dialog>

   <!-- Member list dialog -->
  <member-list-dialog
    :members-dialog="!!membersDialog"
    :is-authorized-member="isAuthorizedMember"
    :wallet="wallet"
    :authorize-member-state="authorizeMemberState"
    :delete-member-state="deleteMemberState"
    @handleAuthorizeMember="handleAuthorizeMember"
    @handleDeleteMember="handleDeleteMember"
  ></member-list-dialog>

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
