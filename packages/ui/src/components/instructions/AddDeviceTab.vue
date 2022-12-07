<script setup lang='ts'>
import step1Image from '@/assets/img/instructions/add/step_1.png'
import step2Image from '@/assets/img/instructions/add/step_2.png'
import step3Image from '@/assets/img/instructions/add/step_3.png'
import step4Image from '@/assets/img/instructions/add/step_4.png'
import step5Image from '@/assets/img/instructions/add/step_5.png'
</script>

<template>
  <q-tab-panel class="add-device-instructions">
    <q-list>
      <q-item v-ripple dense class="q-pa-none">
        <q-item-section>
          <span class="add-title q-pb-sm">
            For security purposes, you can view your channels from one device
            and if you access from another, all messages will be encrypted. To
            add a new device, follow the instructions
          </span>
        </q-item-section>
      </q-item>
      <q-separator />
      <q-item v-ripple dense class="q-py-md">
        <q-item-section>
          <span class="q-pb-sm">
            1. Log in to the new device, press the menu and select the devices
            field
          </span>
          <img :src="step1Image" alt="step">
        </q-item-section>
      </q-item>
      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="q-py-sm">2. Click on the "copy" button</span>
          <img :src="step2Image" alt="step">
        </q-item-section>
      </q-item>
      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="q-py-sm">3. Go back to the main device and in the "devices" window click on the
            "add device" button</span>
          <img :src="step3Image" alt="step">
        </q-item-section>
      </q-item>

      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="q-py-sm">4. Paste the previously copied new device key and click "add device"</span>
          <img :src="step4Image" alt="step">
        </q-item-section>
      </q-item>

      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="q-py-sm">5. Confirm the transaction and your device will be added</span>
          <img :src="step5Image" alt="step">
        </q-item-section>
      </q-item>
    </q-list>
  </q-tab-panel>
</template>
