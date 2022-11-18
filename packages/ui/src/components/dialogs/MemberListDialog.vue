<script lang="ts" setup>
import type { ChannelMembership } from '@app/sdk'
import { shortenAddress } from '@/utils'

defineProps({
  membersDialog: { type: Boolean, default: false },
  authorizeMemberState: { type: Object },
  deleteMemberState: { type: Object },
  wallet: { type: Object },
})
const emit = defineEmits(['submit', 'deleteMember'])

const { state } = useMessengerStore()
const channel = useChannelStore()

function formatMemberName(member: ChannelMembership) {
  if (member?.name && member.name !== '') {
    return member.name
  }
  return shortenAddress(member.authority)
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
            class="row justify-between memberlist-item"
          >
            <q-item-section class="memberlist-info">
              <q-item-label class="row justify-between">
                <span class="text-weight-medium">
                  {{ formatMemberName(m.data) }}</span>
                <q-badge
                  :class="getStatusClass(m.data.status.__kind)"
                  class="memberlist-status q-px-xs"
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
            <q-item-section side class="q-gutter-sm memberlist-btns">
              <q-btn
                v-if="m.data.status.__kind === 'Pending'"
                color="teal"
                rounded
                size="xs"
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
                rounded
                size="xs"
                unelevated
                class="full-width"
                :loading="deleteMemberState.loading"
                :disabled="deleteMemberState.loading"
                @click="$emit('deleteMember', m.data.key)"
              >
                Delete
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

