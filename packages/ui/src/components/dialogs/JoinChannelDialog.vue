<script lang="ts" setup>
const props = defineProps({
  joinChannelState: {type: Object, default: {}}
})

const emit = defineEmits(['handleJoinChannelReset', 'handleJoinChannel'])

const handleJoinChannel = () => emit('handleJoinChannel')
const handleJoinChannelReset = () => emit('handleJoinChannelReset')

</script>
<template>
  <q-dialog v-model="joinChannelState.dialog" class="join-channel-dialog" @hide="handleJoinChannelReset">
    <q-card>
      <q-card-section>
        <q-form class="join-channel-form" @submit.prevent="handleJoinChannel">
          <q-input
            v-model="joinChannelState.name"
            placeholder="Member name *"
            lazy-rules
            :rules="[val => val && val.length > 2 || 'Please type something']"
          />
          <q-input
            v-model="joinChannelState.authority"
            placeholder="Authorize By"
            lazy-rules
            :rules="[val => !val || (val && val.length > 32 || 'Invalid public key')]"
          />
          <br>
          <q-btn type="submit" color="info" :ripple="false" rounded>
            Join Channel
          </q-btn>
        </q-form>
        <q-inner-loading :showing="joinChannelState.loading" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.join-channel-dialog {
  .q-card {
    width: 320px;
  }
}
</style>
