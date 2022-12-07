<script setup lang='ts'>
import step1Image from '@/assets/img/instructions/add/step_1.png'
import step2Image from '@/assets/img/instructions/backup/step_1.png'
import step3Image from '@/assets/img/instructions/backup/step_2.png'
import step4Image from '@/assets/img/instructions/backup/step_3.png'
</script>

<template>
  <q-tab-panel class="add-device-instructions">
    <q-list>
      <q-item v-ripple dense class="q-pa-none">
        <q-item-section>
          <span class="add-title q-pb-sm">
            BackUp key is used to return admin rights in case of loss of access
            to channels
          </span>
        </q-item-section>
      </q-item>
      <q-separator />
      <q-item v-ripple dense class="q-py-md">
        <q-item-section class="q-pb-none">
          <span class="q-pb-sm">
            1. Press the menu and select the devices field
          </span>
          <img :src="step1Image" alt="step">
        </q-item-section>
      </q-item>
      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="q-py-sm">2. Click the export button and save your "backup key" in a safe
            place
          </span>
          <img :src="step2Image" alt="step">
        </q-item-section>
      </q-item>
      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="q-py-sm">3. To import your key in case of a necessary replacement, click on
            the import button</span>
          <img :src="step3Image" alt="step">
        </q-item-section>
      </q-item>

      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="q-py-sm">4. In the area that opens, select your file and click "import
            device key"
          </span>
          <img :src="step4Image" alt="step">
        </q-item-section>
      </q-item>

      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="q-py-sm">Done, your device key has been successfully replaced
          </span>
        </q-item-section>
      </q-item>
    </q-list>
  </q-tab-panel>
</template>
