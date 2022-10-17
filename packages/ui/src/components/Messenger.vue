<script lang="ts" setup>
import { isChannelMembershipStatusPending } from '@app/sdk'
import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'
import { shortenAddress } from '@/utils'
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
  && state.channel?.creator.toString() === wallet.publicKey.value?.toString())
const channels = computed(() => state.allChannels)
const messages = computed(() => state.channelMessages)
const allowSend = computed(() => wallet.publicKey.value && state.channel && !state.sending)
const canAddMember = computed(() => isAuthorizedMember.value)
const canDeleteMember = (member: any) => computed(() => isChannelCreator.value
  && String(member.key) !== String(userStore.keypair?.publicKey))
const canJoinChannel = computed(() => isWalletConnected.value && !isAuthorizedMember.value)

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

function formatMemberName(member: any) {
  if (member?.name && member.name !== '') {
    return member.name
  }
  return shortenAddress(member.authority)
}
</script>

<template>
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
                  {{ isPendingMember ? 'pending&nbsp;request' : 'join&nbsp;channel' }}
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
                :name="msg.sender"
                :text="[msg.content]"
                :sent="msg.sender === wallet.publicKey.value"
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
      </div>
    </div>
  </div>

  <!-- New channel dialog -->
  <q-dialog v-model="newChannelState.dialog" class="new-channel-dialog">
    <q-card>
      <q-card-section>
        <q-form class="messenger-new-channel-form" @submit.prevent="handleNewChannel">
          <q-input
            v-model="newChannelState.name"
            label="Channel name *"
            lazy-rules
            :rules="[val => val && val.length > 2 || 'Please type something']"
          />
          <q-input
            v-model="newChannelState.maxMessages"
            label="Max messages"
            lazy-rules
            :rules="[val => +val > 0 || 'Invalid value']"
          />
          <q-btn type="submit" color="info" :ripple="false" rounded>
            Create Channel
          </q-btn>
        </q-form>
        <q-inner-loading :showing="state.creating" />
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Add member dialog -->
  <q-dialog v-model="addMemberState.dialog" class="add-member-dialog" @hide="handleAddMemberReset">
    <q-card>
      <q-card-section>
        <q-form class="add-member-form" @submit.prevent="handleAddMember">
          <q-input
            v-model="addMemberState.name"
            label="Member name *"
            lazy-rules
            :rules="[val => val && val.length > 2 || 'Please type something']"
          />
          <q-input
            v-model="addMemberState.key"
            label="Member Wallet *"
            lazy-rules
            :rules="[val => val && val.length > 32 || 'Invalid public key']"
          />
          <q-input
            v-model="addMemberState.key"
            label="Member Device Key *"
            lazy-rules
            :rules="[val => val && val.length > 32 || 'Invalid public key']"
          />
          <br>
          <q-btn type="submit" color="info" :ripple="false" rounded>
            Add Member
          </q-btn>
        </q-form>
        <q-inner-loading :showing="addMemberState.loading" />
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Join channel dialog -->
  <q-dialog v-model="joinChannelState.dialog" class="join-channel-dialog" @hide="handleJoinChannelReset">
    <q-card>
      <q-card-section>
        <q-form class="join-channel-form" @submit.prevent="handleJoinChannel">
          <q-input
            v-model="joinChannelState.name"
            placeholder="Member name *"
            lazy-rules
            :rules="[val => val && val.length > 2 || 'Please type something']"
          />
          <q-input
            v-model="joinChannelState.authority"
            placeholder="Authorize By"
            lazy-rules
            :rules="[val => !val || (val && val.length > 32 || 'Invalid public key')]"
          />
          <br>
          <q-btn type="submit" color="info" :ripple="false" rounded>
            Join Channel
          </q-btn>
        </q-form>
        <q-inner-loading :showing="joinChannelState.loading" />
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Member list dialog -->
  <q-dialog v-model="membersDialog">
    <q-card>
      <q-card-section>
        <q-list separator>
          <q-item v-for="m in state.channelMembers" :key="m.pubkey.toString()">
            <q-item-section>
              <q-item-label>{{ formatMemberName(m.data) }}</q-item-label>
              <q-item-label caption lines="2">
                <div>Authority: {{ m.data.authority }}</div>
                <div>Key: {{ m.data.key }}</div>
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-badge :color="getStatusColor(m.data.status)">
                {{ m.data.status.__kind }}
              </q-badge>
              <q-btn
                v-if="m.data.status.__kind === 'Pending'
                  && isAuthorizedMember
                  && (!m.data.status.authority || String(m.data.status.authority) === String(wallet.publicKey.value))"
                color="primary" rounded size="sm" unelevated class="q-mt-sm"
                :loading="authorizeMemberState.loading"
                :disabled="authorizeMemberState.loading"
                @click="handleAuthorizeMember(m.data.key)"
              >
                Authorize
              </q-btn>
              <q-btn
                v-if="canDeleteMember(m.data)"
                color="negative" rounded size="sm" unelevated class="q-mt-sm"
                :loading="deleteMemberState.loading"
                :disabled="deleteMemberState.loading"
                @click="handleDeleteMember(m.data.key)"
              >
                Delete
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.messenger {
  max-width: 800px;
  margin: 0 auto;
}

.messenger-card {
  margin: 0 auto;
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
.channel-form {
  // ..
}
.new-channel-dialog {
  .q-card {
    width: 320px;
  }
}
.add-member-dialog {
  .q-card {
    width: 320px;
  }
}
.join-channel-dialog {
  .q-card {
    width: 320px;
  }
}
</style>
