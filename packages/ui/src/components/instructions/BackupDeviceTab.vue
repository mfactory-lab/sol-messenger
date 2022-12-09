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
          <span class="add-title q-pb-md q-pt-sm">
            The Backup Key can be used to restore admin rights in case you lose
            access to your channels
          </span>
        </q-item-section>
      </q-item>
      <q-separator />
      <q-item v-ripple dense class="q-py-md">
        <q-item-section class="q-pb-none">
          <span class="instructions-step q-pb-md">
            1. Select Devices from the menu.
          </span>
          <img :src="step1Image" alt="step">
        </q-item-section>
      </q-item>
      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="instructions-step">2. Click Export and safely store your Backup Key.
          </span>
          <img :src="step2Image" alt="step">
        </q-item-section>
      </q-item>
      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="instructions-step">3. In order to restore your admin privileges, select Import from
            the menu.</span>
          <img :src="step3Image" alt="step">
        </q-item-section>
      </q-item>

      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="instructions-step">4. In the pop-up window, click Choose File to select your backup
            key file, then click Import Device Key.
          </span>
          <img :src="step4Image" alt="step">
        </q-item-section>
      </q-item>

      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="text-weight-medium">Done, your device key has been successfully replaced.
          </span>
        </q-item-section>
      </q-item>
    </q-list>
  </q-tab-panel>
</template>
