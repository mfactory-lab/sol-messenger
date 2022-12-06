<script lang='ts' setup>
defineProps({ addLoading: Boolean })
const addDeviceEmit = defineEmits(['handleAddDevice'])

const deviceKey = ref('')

const handleAddDevice = () => addDeviceEmit('handleAddDevice', deviceKey.value)
</script>

<template>
  <q-dialog>
    <q-card flat square class="add-device-dialog">
      <q-item class="q-px-md q-pt-md justify-center items-center text-body1">
        Enter device key
      </q-item>
      <q-item class="q-pa-md justify-center">
        <q-form @submit="handleAddDevice">
          <q-input
            v-model="deviceKey"
            class="input"
            label="Device key"
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
</style>
