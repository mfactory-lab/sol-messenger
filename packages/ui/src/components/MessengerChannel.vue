<script setup lang="ts">
import type { Channel } from '@app/sdk'
import type { PropType } from 'vue'
import { getBadgeColor } from '@/utils'

const props = defineProps({
  pubkey: {
    type: Object as PropType<string>,
    required: true,
  },
  channel: {
    type: Object as PropType<Channel>,
    required: true,
  },
  isActive: Boolean,
})

defineEmits(['select'])

const initials = computed(() => props.channel.name.slice(0, 2))

const isPublicChannel = computed(() => props.channel.flags > 0)
</script>

<template>
  <q-item active-class="bg-blue-grey-8 text-white" :active="isActive">
    <q-item-section class="chat-item cursor-pointer" @click="$emit('select')">
      <div class="chat-badge" :style="getBadgeColor(`${pubkey}`)">
        <span>{{ initials }}</span>
      </div>
      <div class="chat-name">
        {{ channel.name }}
      </div>
      <div v-if="isPublicChannel" class="message-public">
        <q-tooltip
          class="bg-white text-black shadow-1"
          style="border-radius: 0;"
          anchor="top middle"
          self="bottom middle"
        >
          Public channel
        </q-tooltip>
        P
      </div>
    </q-item-section>
  </q-item>
</template>

<style scoped lang="scss">
.public-tooltip {
  border-radius: 0 !important;
}
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
}
.message-public {
  background: #00a57d;
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
