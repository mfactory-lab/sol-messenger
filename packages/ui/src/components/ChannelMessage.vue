<script lang="ts" setup>
import { PencilIcon, XIcon } from 'vue-tabler-icons'

defineProps({ text: String, sender: Boolean })

const emit = defineEmits(['handleEdit', 'handleDelete'])

const handleEdit = (text: string) => emit('handleEdit', text)
const handleDelete = () => emit('handleDelete')
</script>

<template>
  <div
    class="message-wrapper"
  >
    <div
      v-if="!sender"
      class="message-actions"
    >
      <pencil-icon width="12" height="12" @click="handleEdit(text)" />
      <x-icon width="12" height="12" @click="handleDelete" />
    </div>
    {{ text }}
  </div>
</template>
