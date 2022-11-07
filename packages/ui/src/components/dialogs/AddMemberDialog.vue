<script lang="ts" setup>
defineProps({
  memberState: { type: Object, default: {} },
})
defineEmits(['submit', 'reset'])
</script>

<template>
  <q-dialog v-model="memberState.dialog" class="add-member-dialog" @hide="$emit('reset')">
    <q-card>
      <q-card-section>
        <q-form class="add-member-form" @submit.prevent="$emit('submit')">
          <q-input
            v-model="memberState.name"
            label="Member name *"
            hint="Min length 3 chars"
            lazy-rules
            :rules="[val => val && val.length > 2 || 'Please type something']"
          />
          <q-input
            v-model="memberState.key"
            label="Member Wallet *"
            lazy-rules
            :rules="[val => val && val.length > 32 || 'Invalid public key']"
          />
          <q-input
            v-model="memberState.key"
            label="Member Device Key"
            hint="Default: The same as member wallet"
            lazy-rules
            :rules="[val => !val || (val.length > 32 || 'Invalid public key')]"
          />
          <br>
          <q-btn type="submit" color="info" :ripple="false" rounded>
            Add Member
          </q-btn>
        </q-form>
        <q-inner-loading :showing="memberState.loading" />
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
