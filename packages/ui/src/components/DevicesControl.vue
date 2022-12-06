<script setup lang='ts'>
import type { PropType } from '@vue/runtime-core'
import { FileDownloadIcon, FileImportIcon, PlusIcon } from 'vue-tabler-icons'
import type { ChannelDevices } from '../store/messenger'

const props = defineProps({
  addLoading: Boolean,
  isAuthorityDevice: Boolean,
  devices: Object as PropType<ChannelDevices[]>,
})

const emit = defineEmits(['handleExport', 'handleAddDevice', 'handleImport'])

const isAddModal = ref(false)
const isImportModal = ref(false)

const handleAddDevice = async (val: string) => {
  await emit('handleAddDevice', val)
}
watch(
  () => props.addLoading,
  (l) => {
    if (!l) {
      isAddModal.value = false
    }
  },
)

const handleImport = (key: string) => emit('handleImport', key)
const closeImportModal = () => (isImportModal.value = false)

const saveJson = () => {
  emit('handleExport')
}
</script>

<template>
  <div class="q-gutter-md row justify-between q-px-sm">
    <q-btn class="control-btn" square flat :disabled="!devices.length" @click="isAddModal = true">
      <custom-tooltip text="Add new device" />
      <plus-icon />
    </q-btn>
    <q-btn class="control-btn" square flat @click="isImportModal = true">
      <custom-tooltip text="Import device key" />
      <file-import-icon />
    </q-btn>
    <q-btn
      class="control-btn"
      square
      flat
      :disabled="!isAuthorityDevice && devices.length"
      @click="saveJson"
    >
      <custom-tooltip text="Export device key" />
      <file-download-icon />
    </q-btn>
  </div>

  <add-device-dialog
    v-model="isAddModal"
    :add-loading="addLoading"
    @handle-add-device="handleAddDevice"
  />

  <import-device-dialog
    v-model="isImportModal"
    :is-import-modal="isImportModal"
    @handle-import="handleImport"
    @close-import-modal="closeImportModal"
  />
</template>

<style lang="scss" scoped>
.q-form {
  width: 100%;
  text-align: center;
}
input {
  font-size: 13px;
  text-align: center;
}

.control-btn {
  background: $primary;
  color: #fff;
  min-width: 0 !important;
  width: 44px;
  height: 44px;
}
</style>
