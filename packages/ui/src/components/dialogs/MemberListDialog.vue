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

const getStatusClass = (status: number) => {
  return status > 0 ? 'pending' : 'authorized'
}

const isCanAuthorizedMember = (status: number) =>
  getStatusClass(status) === 'pending' && channel.canAuthorizeMember

const isOwner = (name: string) => state.channel?.creator.toBase58() === name
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
            active-class="owner"
            :active="`${m.pubkey}` === `${state.channelMembershipAddr}`"
            class="memberlist-item"
          >
            <q-item-section class="memberlist-info">
              <q-item-label class="row justify-between memberlist-info__header">
                <span class="text-weight-medium wallet">
                  {{ formatMemberName(m.data) }}</span>
                <q-badge
                  :class="getStatusClass(m.data.status)"
                  class="memberlist-status q-pa-xs q-ml-lg"
                >
                  {{ getStatusClass(m.data.status) }}
                </q-badge>
              </q-item-label>
              <q-item-label caption lines="2">
                <div class="memberlist-info__details">
                  <span>Authority:</span>
                  <span>{{ m.data.authority }}</span>
                </div>
              </q-item-label>
            </q-item-section>
            <div v-if="channel.canDeleteMember" class="memberlist-btns">
              <q-btn
                v-if="isCanAuthorizedMember(m.data.status)"
                color="positive"
                size="sm"
                unelevated
                class="full-width"
                :loading="authorizeMemberState.loading"
                :disabled="authorizeMemberState.loading"
                @click="$emit('submit', m.data.authority)"
              >
                Authorize
              </q-btn>
              <q-btn
                color="negative"
                size="sm"
                unelevated
                class="full-width"
                :loading="deleteMemberState.loading"
                :disabled="deleteMemberState.loading || isOwner(m.data.authority.toBase58())"
                @click="$emit('deleteMember', m.data.authority)"
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

