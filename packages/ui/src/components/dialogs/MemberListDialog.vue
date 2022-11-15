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
const { isAuthorizedMember, canDeleteMember } = useChannelStore()

function formatMemberName(member: ChannelMembership) {
  if (member?.name && member.name !== '') {
    return member.name
  }
  return shortenAddress(member.authority)
}

function getStatusColor(status: any) {
  if (status?.__kind === 'Authorized') {
    return 'positive'
  }
  return 'grey'
}
</script>

<template>
  <q-dialog>
    <q-card>
      <q-card-section>
        <q-list separator>
          <q-item
            v-for="m in state.channelMembers"
            :key="m.pubkey.toString()"
            active-class="bg-teal-1"
            :active="`${m.pubkey}` === `${state.channelMembershipAddr}`"
          >
            <q-item-section>
              <q-item-label>
                {{ formatMemberName(m.data) }}
                <q-badge :color="getStatusColor(m.data.status)">
                  {{ m.data.status.__kind }}
                </q-badge>
              </q-item-label>
              <q-item-label caption lines="2">
                <div>Authority: {{ m.data.authority }}</div>
                <div>Key: {{ m.data.key }}</div>
              </q-item-label>
            </q-item-section>
            <q-item-section side class="q-gutter-sm">
              <q-btn
                v-if="m.data.status.__kind === 'Pending'
                  && isAuthorizedMember
                  && (!m.data.status.authority || String(m.data.status.authority) === String(wallet.publicKey.value))"
                color="teal" rounded size="xs" unelevated class="full-width"
                :loading="authorizeMemberState.loading"
                :disabled="authorizeMemberState.loading"
                @click="$emit('submit', m.data.key)"
              >
                Authorize
              </q-btn>
              <q-btn
                v-if="canDeleteMember"
                color="negative" rounded size="xs" unelevated class="full-width"
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
