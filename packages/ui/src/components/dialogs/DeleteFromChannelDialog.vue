<script lang='ts' setup>
import type { PropType } from '@vue/runtime-core'

const deleteMemberProps = defineProps({
  channelInfo: Object as PropType<{ channel: String; address: String }>,
})

const isDelete = ref(false)

watch(
  () => deleteMemberProps.channelInfo,
  (n) => {
    if (n) {
      isDelete.value = true
    }
  },
)
</script>

<template>
  <q-dialog v-model="isDelete">
    <q-card square flat>
      <q-card-section>
        You have been removed from the channel
        <span class="text-weight-medium">"{{ deleteMemberProps.channelInfo.channel }}"</span><br><br>
        <span class="text-weight-medium">Channel Address:</span>
        {{ deleteMemberProps.channelInfo.address }}
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
