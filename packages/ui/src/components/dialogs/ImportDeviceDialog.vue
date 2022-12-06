<script lang="ts" setup>
const importEmit = defineEmits(['handleImport', 'closeImportModal'])
const { ok, error } = useHelper()

const secretKeyJSON = ref()

const handleImport = () => {
  const file = secretKeyJSON.value[0]

  const reader = new FileReader()

  reader.addEventListener('load', () => {
    const res = JSON.parse(reader.result as string)
    if (!res.backupKey) {
      error('Invalid Key')
    }
    importEmit('handleImport', res.backupKey)
    importEmit('closeImportModal')
    ok('secret key imported')
  }, false)

  if (file) {
    reader.readAsText(file)
  }
}
</script>

<template>
  <q-dialog>
    <q-card flat square>
      <q-item class="q-pa-md" style="height: 20px;">
        <q-input
          v-model="secretKeyJSON"
          borderless
          type="file"
        />
      </q-item>
      <q-item class="q-pa-md">
        <q-btn class="dialog-submit-btn" :disabled="!secretKeyJSON" flat square @click="handleImport">
          import device key
        </q-btn>
      </q-item>
    </q-card>
  </q-dialog>
</template>
