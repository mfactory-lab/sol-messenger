<script setup lang='ts'>
import type { PublicKey } from '@solana/web3.js'
import { formatMemberName } from '@/utils'

defineProps({
  pendingChannels: Object,
})

const { state } = useMessengerStore()
const authorizeMember = useChannelAuthorizeMember()
const deleteMember = useChannelDeleteMember()

async function handleAuthorize(key: PublicKey, addr: PublicKey) {
  state.channelAddr = addr
  await authorizeMember.submit(key)
}
async function handleDelete(key: PublicKey, addr: PublicKey) {
  state.channelAddr = addr
  await deleteMember.submit(key)
}

const isLoading = computed(() => authorizeMember.state.loading)
const isDelete = computed(() => deleteMember.state.loading)
</script>

<template>
  <q-dialog>
    <q-card class="pending-channels" square flat horizontal>
      <q-card-section>
        <div class="text-h5">
          Channels
        </div>
      </q-card-section>

      <q-card-section>
        <q-list bordered>
          <q-expansion-item
            v-for="(ch, idx) in pendingChannels"
            :key="ch.name"
            expand-separator
            :label="ch.channel.data.name"
            caption="channel"
            :default-opened="idx === 0"
            header-class="owner"
          >
            <q-list separator>
              <q-item
                v-for="member in ch.pendingMembers"
                :key="member"
                class="row justify-between pending-item"
              >
                <q-item-section class="memberlist-info">
                  <q-item-label class="row justify-between">
                    <span class="text-weight-medium">
                      {{ formatMemberName(member.data) }}</span>
                  </q-item-label>
                  <q-item-label caption lines="2">
                    <div class="memberlist-info__details">
                      <span>Authority:</span>
                      <span>{{ member.data.authority }}</span>
                    </div>
                    <div class="memberlist-info__details">
                      <span>Key:</span>
                      <span>{{ member.data.key }}</span>
                    </div>
                  </q-item-label>
                </q-item-section>
                <q-item-section side class="memberlist-btns">
                  <q-btn
                    color="teal"
                    size="xs"
                    unelevated
                    class="full-width"
                    :loading="isLoading"
                    :disabled="isLoading"
                    @click="handleAuthorize(member.data.authority, ch.channel.pubkey)"
                  >
                    Authorize
                  </q-btn>
                  <q-btn
                    color="negative"
                    size="xs"
                    unelevated
                    class="full-width"
                    :loading="isDelete"
                    :disabled="isDelete"
                    @click="handleDelete(member.data.authority, ch.channel.pubkey)"
                  >
                    Remove
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
.pending-channels {
  width: 544px;
}
.pending-item {
  padding: 5px 15px;
}
.owner {
  background: #eceff1;
}
</style>
