<script lang="ts" setup>
import { PencilIcon, XIcon } from 'vue-tabler-icons'

defineProps({
  text: String,
  sender: Boolean,
  messageId: Number,
  messagesCount: Number,
})

const emit = defineEmits(['handleEdit', 'handleDelete'])

const handleEdit = (msg: { messageId: number; text: string }) => emit('handleEdit', msg)
const handleDelete = (messageId: Number) => emit('handleDelete', messageId)

const message = ref(null)
</script>

<template>
  <div class="message-wrapper">
    <div v-if="!sender" class="message-actions">
      <pencil-icon
        width="12"
        height="12"
        @click="
          handleEdit({ messageId: message.lastChild.dataset.id, text: message.lastChild.innerHTML })
        "
      />
      <x-icon
        width="12"
        height="12"
        @click="handleDelete(message.lastChild.dataset.id)"
      />
    </div>
    <div ref="message" v-html="text" />
  </div>
</template>
