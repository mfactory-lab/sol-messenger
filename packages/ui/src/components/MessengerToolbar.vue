<script lang="ts" setup>
import { matMoreHoriz } from '@quasar/extras/material-icons'
import { useWallet } from 'solana-wallets-vue'

const emit = defineEmits(['search', 'showMembers', 'deleteChannel', 'addMember'])

const wallet = useWallet()
const { state } = useMessengerStore()

const isWalletConnected = computed(() => !!wallet.publicKey.value)

const searchText = ref<String>('')
const channel = computed(() => state.channel)
const memberCount = computed(() => {
  if (channel.value?.memberCount === null || channel.value?.memberCount === undefined) {
    return ''
  }
  return `${channel.value?.memberCount}\xA0members`
})
const messageCount = computed(() => {
  if (channel.value?.messageCount === null || channel.value?.messageCount === undefined) {
    return ''
  }
  return `${channel.value?.messageCount}\xA0messages`
})

const onSearch = (value: string) => emit('search', value)
const showMembers = () => emit('showMembers')
const onDeleteChannel = () => emit('deleteChannel')
const onAddMember = () => emit('addMember')
</script>

<template>
  <q-toolbar class="panel-toolbar">
    <div class="panel-search">
      <div class="search-wrapper">
        <q-input
          v-model="searchText"
          class="search-input no-margin q-pa-none"
          placeholder="Search ..."
          clearable
          debounce="300"
          borderless
          @update:model-value="onSearch(searchText)"
          @clear="onSearch('')"
        />
      </div>
    </div>

    <div class="panel-info">
      <div class="chat-info">
        <div class="chat-members">
          {{ memberCount }}
        </div>
        <div class="chat-messages">
          {{ messageCount }}
        </div>
      </div>

      <q-space class="" />
      <div class="chat-name">
        {{ channel?.name }}
      </div>

      <div>
        <q-btn class="chat-menu" flat unelevated :disable="!isWalletConnected">
          <q-icon :name="matMoreHoriz" />
          <q-menu anchor="bottom left" self="top left">
            <q-list style="min-width: 150px" bordered>
              <q-item v-close-popup clickable :disable="!channel" @click="showMembers">
                <q-item-section>Members</q-item-section>
              </q-item>
              <q-item v-close-popup clickable :disable="!channel" @click="onAddMember">
                <q-item-section>Add member</q-item-section>
              </q-item>
              <q-item v-close-popup clickable :disable="!channel" @click="$emit('deleteChannel')">
                <q-item-section>Delete</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>
  </q-toolbar>
</template>

<style lang="scss" scoped>
$main-color: #fff;
$accent-color: #FFD140;

.panel-toolbar {
  color: $main-color;
  border: 1px solid $main-color;
  height: 37px;
  display: flex;
  flex-direction: row;
  padding: 0;

  .panel-search {
    max-width: 170px;
    padding: 0 15px;
    width: 100%;

    input {
      font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: $main-color;
      border: none;
      background: none;
      box-shadow: none;
      outline: none;

      &::placeholder {
        color: $main-color;
      }
    }
  }

  .panel-info {
    border-left: 1px solid $main-color;
    flex: 1;
    display: flex;
    font-family: 'Montserrat', sans-serif;
    align-items: center;
    padding: 10px;
    height: 100%;
    width: 100%;

    .chat-info {
      display: flex;
      font-size: 13px;
      line-height: 16px;
      text-transform: uppercase;

      .chat-members {
        padding-right: 10px;
        margin-right: 10px;
        border-right: 1px solid $main-color;
      }
    }

    .chat-name {
      color: $accent-color;
      font-weight: 500;
      font-size: 13px;
      line-height: 16px;
      text-transform: uppercase;
      margin-right: 16px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      flex: 1;
      text-align: right;
    }

    .chat-menu {
      border: 1px solid rgb(210 230 240 / 20%);
      cursor: pointer;

      &:hover {
        background: rgb(210 230 240 / 20%);;
      }
    }
  }

  @media (max-width: $breakpoint-xs) {
    flex-direction: column;
    height: auto;

    .panel-search {
      max-width: 100%;
      height: 44px;
      display: flex;
      width: 100%;
      align-items: center;
    }
    .search-wrapper {
      width: 100%;
    }
    .panel-info {
      border: none;
      border-top: 1px solid #fff;
    }

    .search-input {

    }
  }
}

input.q-field__native {
  color: $main-color;
}
</style>
