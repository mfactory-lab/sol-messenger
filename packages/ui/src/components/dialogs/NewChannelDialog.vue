<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  defaultState: Object as PropType<{ name: any; maxMessages: number }>,
})

defineEmits(['submit', 'reset'])

const state = ref(props.defaultState)
</script>

<template>
  <q-dialog class="new-channel-dialog" @hide="$emit('reset')">
    <q-card>
      <q-card-section>
        <q-form class="messenger-new-channel-form" @submit.prevent="$emit('submit', state)">
          <q-input
            v-model="state.name"
            label="Channel name *"
            lazy-rules
            maxlength="32"
            :rules="[val => val && val.length > 2 || 'Please type something']"
          />
          <q-input
            v-model="state.maxMessages"
            label="Max messages"
            lazy-rules
            :rules="[val => +val > 0 || 'Invalid value']"
          />
          <q-btn
            type="submit" class="dialog-submit-btn" text-color="white" :ripple="false" rounded
          >
            Create Channel
          </q-btn>
        </q-form>
        <q-inner-loading :showing="loading" />
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
