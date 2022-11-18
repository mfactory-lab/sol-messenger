<script setup lang="ts">
import type { PropType } from 'vue'
import type { useChannelCreate } from '@/hooks/messenger'

type State = Omit<
  ReturnType<typeof useChannelCreate>['state'],
  'loading' | 'dialog'
>

const props = defineProps({
  loading: { type: Boolean, default: false },
  defaultState: Object as PropType<State>,
})

const emit = defineEmits(['submit', 'reset'])

const state = ref(props.defaultState)

const createNewChannel = () => emit('submit', state)
</script>

<template>
  <q-dialog class="new-channel-dialog" @hide="$emit('reset')">
    <q-card>
      <q-card-section>
        <q-form class="messenger-new-channel-form">
          <q-input
            v-model="state.name"
            label="Channel name *"
            lazy-rules
            maxlength="32"
            :rules="[
              (val) => (val && val.length > 2) || 'Please type something',
            ]"
          />
          <q-input
            v-model="state.maxMessages"
            label="Max messages"
            lazy-rules
            :rules="[(val) => +val > 0 || 'Invalid value']"
          />
          <div class="row">
            <div class="col">
              <q-toggle v-model="state.public" label="Public" />
            </div>
            <div class="col">
              <q-toggle
                v-if="!state.public"
                v-model="state.permissionless"
                label="Permissionless"
              />
            </div>
          </div>
        </q-form>
        <q-inner-loading :showing="loading" />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-btn
          type="submit"
          class="dialog-submit-btn"
          text-color="white"
          :ripple="false"
          rounded
          @click="createNewChannel"
        >
          Create Channel
        </q-btn>
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
