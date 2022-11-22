<script lang="ts" setup>
import { formatMemberName } from '@/utils'

defineProps({
  membersDialog: { type: Boolean, default: false },
  authorizeMemberState: { type: Object },
  deleteMemberState: { type: Object },
  wallet: { type: Object },
})
const emit = defineEmits(['submit', 'deleteMember'])

const { state } = useMessengerStore()
const channel = useChannelStore()

const isCanAuthorizedMember = (status: string) => {
  return status === 'Pending' && channel.canAuthorizeMember
}

function getStatusClass(status: any) {
  return String(status).toLowerCase()
}
</script>

<template>
  <q-dialog class="memberlist">
    <q-card square flat horizontal>
      <q-card-section class="q-px-lg">
        MEMBERS
      </q-card-section>
      <q-card-section class="memberlist-card">
        <q-list separator>
          <q-item
            v-for="m in state.channelMembers"
            :key="m.pubkey.toString()"
            active-class="bg-teal-1"
            :active="`${m.pubkey}` === `${state.channelMembershipAddr}`"
            class="memberlist-item"
          >
            <q-item-section class="memberlist-info">
              <q-item-label class="row justify-between">
                <span class="text-weight-medium">
                  {{ formatMemberName(m.data) }}</span>
                <q-badge
                  :class="getStatusClass(m.data.status.__kind)"
                  class="memberlist-status q-pa-xs"
                >
                  {{ m.data.status.__kind }}
                </q-badge>
              </q-item-label>
              <q-item-label caption lines="2">
                <div class="memberlist-info__details">
                  <span>Authority:</span>
                  <span>{{ m.data.authority }}</span>
                </div>
                <div class="memberlist-info__details">
                  <span>Key:</span>
                  <span>{{ m.data.key }}</span>
                </div>
              </q-item-label>
            </q-item-section>
            <div class="memberlist-btns">
              <q-btn
                v-if="isCanAuthorizedMember(m.data.status.__kind)"
                color="positive"
                size="sm"
                unelevated
                class="full-width"
                :loading="authorizeMemberState.loading"
                :disabled="authorizeMemberState.loading"
                @click="$emit('submit', m.data.key)"
              >
                Authorize
              </q-btn>
              <q-btn
                v-if="channel.canDeleteMember"
                color="negative"
                size="sm"
                unelevated
                class="full-width"
                :loading="deleteMemberState.loading"
                :disabled="deleteMemberState.loading"
                @click="$emit('deleteMember', m.data.key)"
              >
                Delete
              </q-btn>
            </div>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

