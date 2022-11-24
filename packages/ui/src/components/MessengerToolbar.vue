<script lang="ts" setup>
import { useWallet } from 'solana-wallets-vue'
import { DotsIcon } from 'vue-tabler-icons'

const emit = defineEmits([
  'search',
  'showMembers',
  'deleteChannel',
  'addMember',
  'showDeviceKey',
])

const wallet = useWallet()
const { state } = useMessengerStore()
const channelStore = useChannelStore()

const isWalletConnected = computed(() => !!wallet.publicKey.value)

const searchText = ref<string>('')
const channel = computed(() => state.channel)
const memberCount = computed(() => {
  if (
    channel.value?.memberCount === null
    || channel.value?.memberCount === undefined
  ) {
    return ''
  }
  return `${channel.value?.memberCount}\xA0members`
})
const messageCount = computed(() => {
  if (
    channel.value?.messageCount === null
    || channel.value?.messageCount === undefined
  ) {
    return ''
  }
  return `${channel.value?.messageCount}\xA0messages`
})

const onSearch = (value: string) => emit('search', value)
const showMembers = () => emit('showMembers')
const onDeleteChannel = () => emit('deleteChannel')
const onAddMember = () => emit('addMember')

const pendingUsersCount = computed(() => {
  if (!channelStore.isOwner || !channelStore.isAdmin) {
    return
  }
  return state.channelMembers.filter(ch => ch.data.status.__kind === 'Pending').length
})

watch(searchText, (s) => {
  onSearch(String(s))
})
</script>

<template>
  <div class="panel-toolbar">
    <messenger-notification />

    <div class="panel-search">
      <div class="search-wrapper">
        <q-input
          v-model="searchText"
          class="search-input no-margin q-pa-none"
          placeholder="Search ..."
          clearable
          debounce="300"
          borderless
          @clear="searchText = ''"
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
        <q-btn class="chat-menu" flat square :disable="!isWalletConnected">
          <dots-icon size="18" />
          <q-menu anchor="bottom middle" self="top middle">
            <q-list style="min-width: 120px" bordered>
              <q-item
                v-close-popup
                class="q-my-sm q-mx-sm q-pa-none chat-menu__item"
                clickable
                @click="$emit('showDeviceKey')"
              >
                <q-item-section class="q-pa-none">
                  <q-btn
                    flat
                    square
                    size="sm"
                    class="bg-blue-grey-7 text-white q-px-xs"
                  >
                    Device key
                  </q-btn>
                </q-item-section>
              </q-item>
              <q-item
                v-close-popup
                class="
                  q-my-sm q-mx-sm q-pa-none
                  chat-menu__item
                  relative-position
                "
                clickable
                :disable="!channel"
                @click="showMembers"
              >
                <q-item-section>
                  <div v-if="pendingUsersCount > 0" class="members-count bg-cyan-9">
                    {{ pendingUsersCount }}
                  </div>
                  <q-btn
                    flat
                    square
                    size="sm"
                    class="bg-cyan-9 text-white q-px-xs"
                  >
                    Members
                  </q-btn>
                </q-item-section>
              </q-item>
              <q-item
                v-close-popup
                class="q-my-sm q-mx-sm q-pa-none chat-menu__item"
                clickable
                :disable="!channelStore.canAddMember"
                @click="onAddMember"
              >
                <q-item-section>
                  <q-btn
                    flat
                    square
                    size="sm"
                    class="bg-amber-7 text-white q-px-xs"
                  >
                    Add member
                  </q-btn>
                </q-item-section>
              </q-item>
              <q-item
                v-close-popup
                class="q-my-sm q-mx-sm q-pa-none chat-menu__item"
                clickable
                :disable="!channelStore.isChannelCreator"
                @click="$emit('deleteChannel')"
              >
                <q-item-section>
                  <q-btn
                    flat
                    square
                    size="sm"
                    class="bg-negative text-white q-px-xs"
                  >
                    Delete
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
$main-color: #fff;
$accent-color: #ffd140;

.panel-toolbar {
  color: $main-color;
  border: 1px solid $main-color;
  height: 38px;
  display: flex;
  flex-direction: row;
  padding: 0;
  position: relative;

  .panel-search {
    width: 219px;
    padding: 0 15px;
    display: flex;
    border-right: 1px solid #fff;
    align-items: center;
    height: 100%;

    input {
      font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial,
        sans-serif;
      font-size: 13px;
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
    flex: 1;
    display: flex;
    font-family: "Montserrat", sans-serif;
    align-items: center;
    padding: 7px 9px 7px 24px;
    height: 100%;
    width: 100%;

    .chat {
      &-info {
        display: flex;
        font-size: 13px;
        line-height: 16px;
        text-transform: uppercase;
      }

      &-members {
        padding-right: 10px;
        margin-right: 10px;
        border-right: 1px solid $main-color;
      }

      &-name {
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

      &-menu {
        border: 1px solid rgb(210 230 240 / 20%);
        background: rgb(146 167 177 / 20%);
        cursor: pointer;
        position: relative;
        height: 22px;
        min-height: 0;
        width: 31px;
        padding: 0;
        transform: translateX(2px);

        &:hover {
          background: rgb(146 167 177 / 50%);
        }
      }
    }
  }

  .panel-notifications {
    position: absolute;
    height: 24px;
    top: -15px;
    left: 100px;
    width: auto;
    display: inline-flex;
    align-items: center;

    &__info {
      cursor: pointer;
      color: $gray-blue;
      background: #ffffff;
      border-radius: 20px;
      height: 100%;
      padding: 0 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      gap: 3px;
      z-index: 2;
    }

    &__details {
      white-space: nowrap;
      position: relative;
      z-index: 1;
      width: 0;
      overflow: hidden;
      transition: 0.3s all ease;
      background: #ffffff;
      color: $primary;
      height: 100%;
      display: flex;
      align-items: center;
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
      margin-left: 20px;
      padding-left: 25px;
      cursor: pointer;
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
      padding: 5px 10px;
      .chat-info,
      .chat-name {
        font-size: 11px;
      }
    }

    .search-input {
    }
  }
}

input.q-field__native {
  color: $main-color;
}

.chat-menu__item {
  min-height: 0 !important;
  z-index: 1;

  .members-count {
    position: absolute;
    top: -7px;
    right: -7px;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid #fff;
    color: #fff;
    font-size: 12px;
    padding: 6px;
    z-index: 2;
  }
}
</style>
