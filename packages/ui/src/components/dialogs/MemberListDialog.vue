<script lang="ts" setup>
import { formatMemberName } from '@/utils'

defineProps({
  membersDialog: { type: Boolean, default: false },
  authorizeMemberState: { type: Object },
  deleteMemberState: { type: Object },
  wallet: { type: Object },
})
defineEmits(['submit', 'deleteMember'])

const { state } = useMessengerStore()
const channel = useChannelStore()

function getStatusClass(status: number) {
  return status > 0 ? 'pending' : 'authorized'
}

const canAuthorizeMember = computed(() => channel.canAuthorizeMember)
const isAuthorizedMember = computed(() => channel.isAuthorizedMember)
const isPermissionlessChannel = computed(() => channel.isPermissionlessChannel)

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
                <span class="text-weight-medium row wallet">
                  {{ formatMemberName(m.data) }}
                  <div
                    v-if="isOwner(m.data.authority.toBase58())"
                    class="channel-owner"
                  >
                    <custom-tooltip text="Channel Owner" />
                    <img src="@/assets/img/star.svg">
                  </div>
                </span>
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
            <div class="memberlist-btns">
              <q-btn
                v-if="getStatusClass(m.data.status) === 'pending'
                  && (canAuthorizeMember || (isAuthorizedMember && isPermissionlessChannel))"
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
                v-if="channel.canDeleteMember"
                color="negative"
                size="sm"
                unelevated
                class="full-width"
                :loading="deleteMemberState.loading"
                :disabled="
                  deleteMemberState.loading
                    || isOwner(m.data.authority.toBase58())
                "
                @click="$emit('deleteMember', m.data.authority)"
              >
                Remove
              </q-btn>
            </div>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
