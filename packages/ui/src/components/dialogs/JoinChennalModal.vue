<script lang="ts" setup>
defineEmits(['join'])
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
            :rules="[
              (val) => (val && val.length > 2) || 'Your name',
            ]"
          />
          <br>
          <q-btn
            type="submit"
            class="dialog-submit-btn"
            text-color="black"
            :ripple="false"
            square
          >
            Join Channel
          </q-btn>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang='scss'>
.join-channel-form {
  text-align: center;
  width: 240px;
}

.refresh-btn {
  svg {
    animation: RotateArrow 1s linear infinite;
  }
}

@keyframes RotateArrow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}
</style>
