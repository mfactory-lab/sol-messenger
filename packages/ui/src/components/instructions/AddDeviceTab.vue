<script setup lang='ts'>
import step1Image from '@/assets/img/instructions/add/step_1.png'
import step2Image from '@/assets/img/instructions/add/step_2.png'
import step3Image from '@/assets/img/instructions/add/step_3.png'
import step4Image from '@/assets/img/instructions/add/step_4.png'
import step5Image from '@/assets/img/instructions/add/step_5.png'
import step6Image from '@/assets/img/instructions/add/step_6.png'
</script>

<template>
  <q-tab-panel class="add-device-instructions">
    <q-list>
      <q-item v-ripple dense class="q-pa-none">
        <q-item-section>
          <span class="add-title q-pb-none q-pt-sm">
            For security purposes, you can only access your channels from a
            single device. If you try to view them from another device, all
            messages will appear encrypted.
          </span>
          <span class="add-title q-pb-md q-pt-sm">
            In order to add a new device, follow these instructions:
          </span>
        </q-item-section>
      </q-item>
      <q-separator />
      <q-item v-ripple dense class="q-py-md">
        <q-item-section>
          <span class="instructions-step">
            1. Log in with your new device and select Devices from the menu
          </span>
          <img :src="step1Image" alt="step">
        </q-item-section>
      </q-item>
      <q-item v-ripple dense class="q-py-md">
        <q-item-section>
          <span class="instructions-step">
            2. Copy your new device key.
          </span>
          <img :src="step2Image" alt="step">
        </q-item-section>
      </q-item>
      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="instructions-step">3. On your main device, select the channel to which you will add the device</span>
          <img :src="step3Image" alt="step">
        </q-item-section>
      </q-item>
      <q-item v-ripple dense class="instructions-step">
        <q-item-section>
          <span class="instructions-step">4. Pull up the Devices window and click Add Device.</span>
          <img :src="step4Image" alt="step">
        </q-item-section>
      </q-item>

      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="instructions-step">5. Enter the previously copied key and click Add.</span>
          <img :src="step5Image" alt="step">
        </q-item-section>
      </q-item>

      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span class="instructions-step">6. Confirm the transaction</span>
          <img :src="step6Image" alt="step">
        </q-item-section>
      </q-item>
      <q-item v-ripple dense class="q-py-sm">
        <q-item-section>
          <span
            class="text-weight-medium"
          >Congratulations, you have added a new device.
          </span>
        </q-item-section>
      </q-item>
    </q-list>
  </q-tab-panel>
</template>
