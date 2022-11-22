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
    anchor="top middle"
    self="bottom middle"
    class="bg-grey-9 text-body2"
  >
    {{ text }}
  </q-tooltip>
</template>
