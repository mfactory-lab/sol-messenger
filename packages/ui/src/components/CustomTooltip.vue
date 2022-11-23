<script lang="ts">
export default defineComponent({
  props: {
    text: {
      type: String,
      default: '',
    },
    padding: {
      type: String,
      default: '0',
    },
  },
})
</script>

<template>
  <q-tooltip
    class="bg-white text-primary  shadow-1 custom-tooltip"
    style="border-radius: 0"
    anchor="top middle"
    self="bottom middle"
  >
    <div :style="{ fontSize: '11px', padding: `${padding}` }" v-html="text" />
  </q-tooltip>
</template>

<style lang='scss'>
.custom-tooltip {
  font-family: $font-primary;
  max-width: 285px;

  span {
    font-weight: 600;
  }
}
</style>
