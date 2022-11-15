<script lang="ts" setup>
import type { PropType } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  defaultState: Object as PropType<{ name: any; authority: string }>,
})

defineEmits(['submit', 'reset'])
const state = ref(props.defaultState)
</script>

<template>
  <q-dialog class="join-channel-dialog" @hide="$emit('reset')">
    <q-card>
      <q-card-section>
        <q-form class="join-channel-form" @submit.prevent="$emit('submit', state)">
          <q-input
            v-model="state.name"
            placeholder="Member name *"
            lazy-rules
            :rules="[val => val && val.length > 2 || 'Please type something']"
          />
          <q-input
            v-model="state.authority"
            placeholder="Authorize By"
            lazy-rules
            :rules="[val => !val || (val && val.length > 32 || 'Invalid public key')]"
          />
          <br>
          <q-btn type="submit" class="dialog-submit-btn" text-color="white" :ripple="false" rounded>
            Join Channel
          </q-btn>
        </q-form>
        <q-inner-loading :showing="loading" />
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
