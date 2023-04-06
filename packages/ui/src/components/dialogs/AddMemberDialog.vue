<script lang="ts" setup>
import type { PropType } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  defaultState: {
    type: Object as PropType<{ [key: string]: any }>,
    required: true,
  },
})

const emit = defineEmits(['submit', 'reset'])

const state = toRef(props, 'defaultState')

const addMember = () => emit('submit', state.value)
</script>

<template>
  <q-dialog class="add-member-dialog" @hide="$emit('reset')">
    <q-card square flat>
      <q-card-section>
        <q-form class="add-member-form" @submit.prevent="addMember">
          <q-input
            v-model="state.name"
            label="Member name *"
            hint="Min length 3 chars"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 2) || 'Please type something',
            ]"
          />
          <q-input
            v-model="state.wallet"
            label="Member Wallet *"
            lazy-rules
            :rules="[(val) => (val && val.length > 32) || 'Invalid public key']"
          />
          <q-input
            v-model="state.key"
            label="Member Device Key"
            hint="Default: The same as member wallet"
            lazy-rules
            :rules="[(val) => !val || val.length > 32 || 'Invalid public key']"
          />
          <br>
          <q-btn
            type="submit"
            class="dialog-submit-btn"
            text-color="black"
            :ripple="false"
            square
            flat
          >
            Add Member
          </q-btn>
        </q-form>
        <q-inner-loading :showing="loading" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.add-member-dialog {
  .q-card {
    width: 320px;
  }
}
</style>
