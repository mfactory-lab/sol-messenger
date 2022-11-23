<script setup lang="ts">
import type { PropType } from 'vue'
import type { useChannelCreate } from '@/hooks/messenger'
import { CHANNEL_INFO } from '@/config'

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
    <q-card square flat>
      <q-card-section>
        <q-form class="messenger-new-channel-form" @submit="createNewChannel">
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
          <div class="row q-mt-md relative-position" style="height: 42px">
            <div class="toggle-info">
              <custom-tooltip :text="CHANNEL_INFO[0]" />
              <img src="@/assets/img/info.svg" alt="info">
            </div>
            <div
              class="col text-primary"
              :class="{ 'toggle-border': !state.public }"
            >
              Private<q-toggle v-model="state.public" label="Public" />
            </div>
            <div v-if="!state.public" class="row text-primary toggle-approve">
              <q-toggle v-model="state.permissionless" />
              <span>
                <div class="toggle-info">
                  <custom-tooltip :text="CHANNEL_INFO[1]" />
                  <img src="@/assets/img/info.svg" alt="info">
                </div>
                Members can approve</span>
            </div>
          </div>
          <q-btn
            type="submit"
            class="dialog-submit-btn q-mt-md"
            text-color="black"
            :ripple="false"
            square
            flat
          >
            Create the Channel
          </q-btn>
        </q-form>
        <q-inner-loading :showing="loading" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
.new-channel-dialog {
  .q-card {
    width: 320px;
  }
}

.q-toggle__label .q-anchor--skip {
  display: none !important;
}

.toggle {
  &-border {
    border-right: 1px solid #455a645c;
  }

  &-info {
    position: absolute;
    top: -15px;
    cursor: pointer;
  }

  &-approve {
    width: 140px;
    align-items: center;

    span {
      width: 58%;
      line-height: 15px;
    }
  }
}
</style>
