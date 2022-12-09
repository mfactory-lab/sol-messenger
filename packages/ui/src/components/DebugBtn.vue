<script lang="ts" setup>
import { useChannelStore } from '@/store/channel'
const props = defineProps({
  isDebugOpen: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['handleDebugBtn'])

const { state } = useMessengerStore()
const { isAuthorizedMember, isPendingMember, isChannelCreator } = useChannelStore()
const dialog = ref(false)

watch(() => props.isDebugOpen, (d) => {
  if (state.channel) {
    dialog.value = d
  }
})
</script>

<template>
  <q-dialog v-model="dialog" @hide="$emit('handleDebugBtn')">
    <q-card style="width: 800px; max-width: 80vw;">
      <q-card-section>
        <div
          v-for="row in [
            ['Authorized', isAuthorizedMember],
            ['Pending Access', isPendingMember],
            ['Channel Creator', isChannelCreator],
            ['Channel Address', state.channelAddr],
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
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
