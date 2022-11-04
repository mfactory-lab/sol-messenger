<script lang="ts" setup>
import { matMoreHoriz } from '@quasar/extras/material-icons'
const props = defineProps({
  chatName: { type: String, default: '' },
  membersCount: { type: Number, default: 0 },
  messagesCount: { type: Number, default: 0 },
  channels: null,
  currentChannel: null,
})
const emit = defineEmits(['change'])
const {
  state,
  postMessage,
  addMember, deleteMember, authorizeMember,
  createChannel, loadChannel, deleteChannel, joinChannel,
} = useMessengerStore()

const searchText = ref('')
const currentChanel = computed(() => props.currentChannel)
const memberCount = ref()
const messageCount = ref()

watch(currentChanel, (channel) => {
  console.log(channel, channel?.name, channel?.memberCount)
  memberCount.value = `${channel?.memberCount}\xA0members`
  messageCount.value = `${channel?.messageCount}\xA0messages`
})
const test = (value: string) => {
  console.log(value)
  emit('change', value)
}
</script>

<template>
  <q-toolbar>
    <div class="panel-search">
      <div class="search-wrapper">
        <q-input
          v-model="searchText"
          class="search-input no-margin q-pa-none"
          placeholder="Search ..."
          clearable
          debounce="300"
          @update:model-value="test(searchText)"
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

      <q-space />
      <div class="chat-name">
        {{ currentChanel?.name }}
      </div>

      <div class="chat-menu">
        <q-icon :name="matMoreHoriz" />
        <q-menu anchor="bottom left" self="top left">
          <q-list style="min-width: 150px" bordered>
            <q-item v-close-popup clickable>
              <q-item-section>Members</q-item-section>
            </q-item>
            <q-item v-close-popup clickable>
              <q-item-section>Add member</q-item-section>
            </q-item>
            <q-item v-close-popup clickable>
              <q-item-section>Delete</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </div>
  </q-toolbar>
</template>

<style lang="scss" scoped>
$main-color: #fff;
$accent-color: #FFD140;

.q-toolbar {
  color: $main-color;
  border: 1px solid $main-color;
  height: 37px;
  display: flex;
  flex-direction: row;
  padding: 0;
  margin-bottom: 20px;

  @media (max-width: $breakpoint-xs) {
    flex-direction: column;
  }

  .panel-search {
    width: 170px;
    padding: 0 15px;

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
      overflow:hidden;
      white-space:nowrap;
      text-overflow: ellipsis;
      flex: 1;
    }

    .chat-menu {
      border: 1px solid rgb(210 230 240 / 20%);
      padding: 0 10px;
      cursor: pointer;

      &:hover {
        background: rgb(210 230 240 / 20%);;
      }
    }
  }
}
input.q-field__native {
  color: $main-color;
}
</style>
