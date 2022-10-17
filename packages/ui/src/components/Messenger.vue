<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'
const { notify } = useQuasar()
const wallet = useWallet()

const { state, postMessage, addMember, authorizeMember, createChannel, loadChannel, deleteChannel } = useMessengerStore()

const membersDialog = ref(false)

const addMemberState = reactive({
  dialog: false,
  loading: false,
  name: '',
  key: '',
})

const newChannelState = reactive({
  dialog: false,
  name: '',
  maxMessages: 15,
})

const form = reactive({
  message: '',
})

async function sendMessage() {
  if (checkWalletConnected()) {
    await postMessage(form.message)
    form.message = ''
  }
}

function addNewChannel() {
  if (checkWalletConnected()) {
    newChannelState.dialog = true
  }
}

async function handleNewChannel() {
  if (checkWalletConnected()) {
    await createChannel(newChannelState.name, newChannelState.maxMessages)
    newChannelState.dialog = false
    newChannelState.name = ''
    notify({ type: 'positive', message: 'Channel was created!', timeout: 2000 })
  }
}

async function handleAddMemberReset() {
  addMemberState.loading = false
  addMemberState.name = ''
  addMemberState.key = ''
}

async function handleAuthorizeMember(key: any) {
  try {
    await authorizeMember(key)
    notify({ type: 'info', message: 'Member was authorized', timeout: 2000 })
  } catch (e) {
    notify({ type: 'negative', message: 'Something went wrong', timeout: 2000 })
  }
}

async function handleAddMember() {
  addMemberState.loading = true
  if (!state.channelAddr) {
    notify({ type: 'info', message: 'Please select a channel', timeout: 2000 })
    return
  }
  await addMember(state.channelAddr, addMemberState.key, addMemberState.name)
  addMemberState.loading = false
}

function checkWalletConnected() {
  if (!wallet.publicKey.value) {
    notify({ type: 'negative', message: 'Please connect wallet', timeout: 2000 })
    return false
  }
  return true
}

async function joinChannel(addr: any) {

}

async function removeChannel(addr: any) {
  await deleteChannel(addr)
  notify({ type: 'positive', message: 'Channel was deleted!', timeout: 2000 })
}

async function selectChannel(addr: any) {
  await loadChannel(addr)
}

function getStatusColor(status: any) {
  if (status?.__kind === 'Authorized') {
    return 'positive'
  }
}

const isWalletConnected = computed(() => !!wallet.publicKey.value)
const channels = computed(() => state.allChannels)
const messages = computed(() => state.channelMessages)
const allowSend = computed(() => wallet.publicKey.value && state.channel && !state.sending)
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

                <q-item-section side>
                  <q-btn-dropdown v-if="isWalletConnected" unelevated rounded>
                    <q-list>
                      <q-item v-close-popup clickable @click="joinChannel(ch.pubkey)">
                        <q-item-section>
                          <q-item-label>Join channel</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item
                        v-if="String(ch.data.creator) === String(wallet.publicKey.value)"
                        v-close-popup clickable
                        @click="removeChannel(ch.pubkey)"
                      >
                        <q-item-section class="text-negative">
                          <q-item-label>Delete channel</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </q-item-section>
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
            <div v-if="isWalletConnected" class="col">
              <q-btn-group rounded unelevated>
                <q-btn
                  color="secondary" text-color="dark"
                  :loading="addMemberState.loading"
                  @click="addMemberState.dialog = true"
                >
                  add member
                </q-btn>

                <q-btn
                  color="primary"
                  @click="membersDialog = true"
                >
                  show members
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
                v-model="form.message"
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

  <!-- Dialogs -->
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
            label="Member Key *"
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

  <q-dialog v-model="membersDialog">
    <q-card>
      <q-card-section>
        <q-list separator>
          <q-item v-for="m in state.channelMembers" :key="m.pubkey.toString()">
            <q-item-section>
              <q-item-label>{{ m.data.name && m.data.name !== '' ? m.data.name : m.data.authority }}</q-item-label>
              <q-item-label caption lines="2">
                {{ m.data.key }}
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-badge :color="getStatusColor(m.data.status)">
                {{ m.data.status.__kind }}
              </q-badge>
              <q-btn
                v-if="m.data.status.__kind === 'Pending' && (!m.data.status.authority || String(m.data.status.authority) === String(wallet.publicKey.value))"
                color="primary" rounded size="sm" unelevated class="q-mt-sm"
                @click="handleAuthorizeMember(m.data.key)"
              >
                Authorize
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
</style>
