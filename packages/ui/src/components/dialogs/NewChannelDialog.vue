<script setup lang="ts">

const props = defineProps({
  channelState: { type: Object, default: null },
  stateCreating: {type: Boolean, default: false }
})

const emit = defineEmits(['handleNewChannel'])

const handleNewChannel = () => emit('handleNewChannel');

</script>
<template>
  <q-dialog v-model="channelState.dialog" class="new-channel-dialog">
    <q-card>
      <q-card-section>
        <q-form class="messenger-new-channel-form" @submit.prevent="handleNewChannel">
          <q-input
            v-model="channelState.name"
            label="Channel name *"
            lazy-rules
            :rules="[val => val && val.length > 2 || 'Please type something']"
          />
          <q-input
            v-model="channelState.maxMessages"
            label="Max messages"
            lazy-rules
            :rules="[val => +val > 0 || 'Invalid value']"
          />
          <q-btn type="submit" color="info" :ripple="false" rounded>
            Create Channel
          </q-btn>
        </q-form>
        <q-inner-loading :showing="stateCreating" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<style scoped lang="scss">
.new-channel-dialog {
  .q-card {
    width: 320px;
  }
}
</style>
