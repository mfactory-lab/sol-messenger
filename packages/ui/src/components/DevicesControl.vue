<script setup lang='ts'>
import { FileDownloadIcon, FileImportIcon, PlusIcon } from 'vue-tabler-icons'

defineProps({ addLoading: Boolean, isAuthorityDevice: Boolean })

const emit = defineEmits(['handleExport', 'handleAddDevice', 'handleImport'])

const { ok } = useHelper()

const isAddModal = ref(false)
const isImportModal = ref(false)

const deviceKey = ref('')

const secretKeyJSON = ref()

const handleAddDevice = async () => {
  await emit('handleAddDevice', deviceKey.value)
  isAddModal.value = false
}
const handleImport = () => {
  const file = secretKeyJSON.value[0]

  const fileReader = new FileReader()
  const reader = new FileReader()

  reader.addEventListener('load', () => {
    const res = JSON.parse(reader.result as string)
    emit('handleImport', res.secretKey)
    ok('secret key imported')
    isAddModal.value = false
  }, false)

  if (file) {
    reader.readAsText(file)
  }
}

const saveJson = () => {
  emit('handleExport')
}
</script>

<template>
  <div class="q-gutter-md row justify-between q-px-sm">
    <q-btn class="control-btn" square flat @click="isAddModal = true">
      <custom-tooltip text="Add new device" />
      <plus-icon />
    </q-btn>
    <q-btn class="control-btn" square flat @click="isImportModal = true">
      <custom-tooltip text="Import device key" />
      <file-import-icon />
    </q-btn>
    <q-btn class="control-btn" square flat :disabled="!isAuthorityDevice" @click="saveJson">
      <custom-tooltip text="Export device key" />
      <file-download-icon />
    </q-btn>
  </div>

  <q-dialog v-model="isAddModal">
    <q-card flat square class="add-device-dialog">
      <q-item class="justify-center items-center text-body1">
        Enter device key
      </q-item>
      <q-item class="justify-center">
        <q-form @submit="handleAddDevice">
          <q-input
            v-model="deviceKey"
            class="input"
            label="Device key"
            borderless
            dense
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please enter device key',
            ]"
          />
          <q-btn type="submit" class="dialog-submit-btn" flat square>
            add device
          </q-btn>
        </q-form>
      </q-item>

      <q-inner-loading :showing="addLoading" />
    </q-card>
  </q-dialog>

  <q-dialog v-model="isImportModal">
    <q-card flat square>
      <q-item>
        <q-input
          v-model="secretKeyJSON"
          type="file"
          hint="Secret Key"
        />
      </q-item>
      <q-item>
        <q-btn class="dialog-submit-btn" flat square @click="handleImport">
          import device key
        </q-btn>
      </q-item>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.add-device-dialog {
  width: 450px;
}
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
