<script lang="ts">
export default defineComponent({
  props: {
    text: {
      type: String,
      default: '',
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
    <div v-html="text" />
  </q-tooltip>
</template>

<style lang='scss'>
.custom-tooltip {
  font-family: $font-primary;
  font-size: 10px;
  line-height: 12px;
  max-width: 240px;

  span {
    font-weight: 600;
  }
}
</style>
