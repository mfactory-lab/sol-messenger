<script lang="ts" setup>
defineProps({
  isPendingMember: { type: Boolean, default: false },
  canJoinChannel: { type: Boolean, default: false },
  isJoining: { type: Boolean, default: false },
})
defineEmits(['createChannel', 'joinChannel'])
</script>

<template>
  <q-item>
    <q-item-section class="button-wrapper">
      <q-btn class="control-button" square @click="$emit('createChannel')">
        <img src="@/assets/img/add.svg" alt="">
      </q-btn>
      <q-btn
        v-if="canJoinChannel"
        class="control-button"
        square
        :loading="isJoining"
        :disable="isPendingMember"
        @click="$emit('joinChannel')"
      >
        <img src="@/assets/img/join.svg" alt="">
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<style scoped lang="scss">
.q-item {
  padding: 8px;
}

.button-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-direction: row;
  gap: 9px;

  .control-button {
    width: 44px;
    height: 44px;
    background: #516670;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
