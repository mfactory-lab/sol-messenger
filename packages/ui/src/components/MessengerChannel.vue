<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  channel: Object as PropType<{ data: any; pubkey: string }>,
  state: Object,
})
const emit = defineEmits(['selectChannel'])

const selectChannel = () => emit('selectChannel')

const getBadgeColor = (text: string) => {
  if (!text) {
    return { background: '#000' }
  }
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 255
    color += (`00${value.toString(16)}`).substr(-2)
  }
  return { background: color }
}
</script>

<template>
  <q-item
    active-class="bg-blue-grey-1 text-grey-8"
    :active="`${state.channelAddr}` === `${channel.pubkey}`"
  >
    <q-item-section class="chat-item cursor-pointer" @click="selectChannel">
      <div class="chat-badge" :style="getBadgeColor(`${channel.pubkey}`)">
        <span>{{ channel.data.name.slice(0, 2) }}</span>
      </div>

      <div class="chat-name">
        {{ channel.data.name }}
      </div>

      <div class="message-count">
        {{ channel.data.messageCount }}
      </div>
    </q-item-section>
  </q-item>
</template>

<style scoped lang="scss">
.chat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
}
.chat-badge {
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;

  span {
    text-transform: uppercase;
    font-size: 11px;
    line-height: 13px;
    color: #fff;
  }
}

.chat-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
  margin: 0 10px;
  text-align: center;
}
.message-count {
  border-radius: 50%;
  background: #00A57D;
  color: #fff;
  font-size: 10px;
  line-height: 11px;
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
