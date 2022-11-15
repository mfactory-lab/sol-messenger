<script lang="ts" setup>
import { useChannelStore } from '@/store/channel'
const { state } = useMessengerStore()
const { isAuthorizedMember, isPendingMember, isChannelCreator } = useChannelStore()
const dialog = ref(false)
const toggle = useToggle(dialog)
</script>

<template>
  <q-btn flat class="text-blue-2" @click="toggle()">
    Debug info
  </q-btn>
  <q-dialog v-model="dialog">
    <div
      v-for="row in [
        ['Authorized', isAuthorizedMember],
        ['Pending Access', isPendingMember],
        ['Channel Creator', isChannelCreator],
        ['Channel', state.channel],
        ['Membership', state.channelMembership],
        ['Members', state.channelMembers],
      ]"
      :key="row[0]"
      class="row q-mt-md"
    >
      <div class="col col-4">
        {{ row[0] }}
      </div>
      <div class="col">
        <pre class="no-margin">{{ row[1] }}</pre>
      </div>
    </div>
  </q-dialog>
</template>
