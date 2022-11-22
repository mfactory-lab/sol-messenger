<script lang="ts" setup>
import type { Channel } from '@app/sdk'
import type { PropType } from '@vue/runtime-core'

const emit = defineEmits(['join'])
const name = ref('')
</script>

<template>
  <q-dialog>
    <q-card square flat>
      <q-card-section class="text-body1">
        Join Channel
      </q-card-section>
      <q-card-section class="text-body1 text-blue-grey-8">
        <q-form class="join-channel-form" @submit.prevent="$emit('join', name)">
          <q-input
            v-model="name"
            label="Member name *"
            lazy-rules
            :rules="[val => val && val.length > 2 || 'Please type something']"
          />
          <br>
          <q-btn type="submit" class="dialog-submit-btn" text-color="white" :ripple="false" rounded>
            Join Channel
          </q-btn>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.join-channel-form {
    text-align: center;
    width: 240px;
}
</style>
