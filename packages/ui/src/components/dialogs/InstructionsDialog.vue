<script lang="ts" setup>
import { evaClose } from '@quasar/extras/eva-icons'

const tab = ref('add')
</script>

<template>
  <q-dialog>
    <q-card square flat class="instructions-card">
      <q-card-section class="row items-center justify-between q-pb-sm ">
        <span class="text-h6">Instructions</span>
        <q-btn v-close-popup size="10px" flat round dense :icon="evaClose" />
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="add" label="Add Device" />
          <q-tab name="backup" label="backup" />
        </q-tabs>

        <q-tab-panels v-model="tab" animated class="panels-height">
          <add-device-tab name="add" />
          <backup-device-tab name="backup" />
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
.instructions-card {
    width: 560px;
}

.panels-height {
    max-height: 800px;
    height: 70vh;
}
.add-device-instructions {
  .add-title {
    font-size: 12px;
    line-height: 16px;
    font-weight: 500;
  }

  img {
    width: 100%;
  }
}
</style>
