<script lang="ts" setup>
import addIcon from "@/assets/img/add.svg";
import joinIcon from "@/assets/img/join.svg";

const emit = defineEmits(['createChannel', 'joinChannel',])
const props = defineProps({
  isWalletConnected: { type: Boolean, default: false },
  isAuthorizedMember: { type: Boolean, default: false },
  canJoinChannel: { type: Boolean, default: false },
  isPendingMember: { type: Boolean, default: false },
  joinChannelState: {type: Object, default: {}}
})

const createChannel = () => emit('createChannel');
const joinChannel = () => emit('joinChannel');

</script>

<template>
  <q-item>
    <q-item-section class="button-wrapper">
      <q-btn class="control-button" @click="createChannel" square>
        <img
          :src="addIcon"/>
      </q-btn>
      <q-btn
        class="control-button"
        square
        @click="joinChannel"
        :loading="joinChannelState.loading"
        :disable="isPendingMember"
        v-if="canJoinChannel">
        <img :src="joinIcon"/>
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
