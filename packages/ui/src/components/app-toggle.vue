<script lang="ts" setup>
const props = defineProps({
  value: { type: Boolean, required: true },
  label: { type: String, default: '' },
})
const emit = defineEmits(['input'])
const backgroundStyles = computed(() => ({
  'gold-mid': props.value,
  'gray-lighter': !props.value,
}))

const indicatorStyles = computed(() => ({ transform: props.value ? 'translateX(24px)' : 'translateX(0)' }))
const toggle = () => emit('input')
</script>

<template>
  <div class="app-toggle-wrapper">
    <span class="toggle-label">
      {{ props.label }}
    </span>
    <span
      class="toggle-btn-wrapper"
      role="checkbox"
      :aria-checked="value.toString()"
      tabindex="0"
      @click="toggle"
      @keydown.space.prevent="toggle"
    >
      <span
        class="toggle-background"
        :class="backgroundStyles"
      />
      <span
        class="toggle-indicator"
        :style="indicatorStyles"
      />
    </span>
  </div>
</template>

<style lang="scss" scoped>
.app-toggle-wrapper {
  display: flex;
  align-items: center;

  .toggle-label {
    margin-right: 15px;
    text-transform: uppercase;
    line-height: 35px;
  }
}
.gold-mid{
  //background-color: #666666;
}

.gray-lighter{
  background: transparent;
}

.toggle-btn-wrapper {
  display: inline-block;
  position: relative;
  cursor: pointer;
  width: 50px;
  height: 26px;
  border-radius: 9999px;
}

.toggle-btn-wrapper:focus {
  outline: 0;
}

.toggle-background {
  display: inline-block;
  border-radius: 9999px;
  height: 100%;
  width: 100%;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color .4s ease;
  border: 1px solid #fff;
}

.toggle-indicator {
  position: absolute;
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: #ffffff;
  border-radius: 9999px;
  box-shadow:  0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform .4s ease;
}
</style>
