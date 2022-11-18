<script lang="ts" setup>
import type { PropType } from '@vue/runtime-core'
import { useAnchorWallet } from 'solana-wallets-vue'
import type { AllChannels } from '../store/messenger'

const { loadMembers } = useMessengerStore()
const channel = useChannelStore()

const wallet = useAnchorWallet()

const pendingChannels = ref<AllChannels[] | undefined>()

const notifications = $computed(() => pendingChannels.value?.length ?? 0)
const isNotifications = computed(() => notifications > 0)

const showInfo = ref(false)
const infoWidth = computed(() => {
  return showInfo.value ? 'width: 100%; padding-right: 14px' : 'width: 0; padding-right: 0;'
})
watch(
  () => channel.ownChannels,
  async (p, n) => {
    if (n.length > 0) {
      try {
        const res = await Promise.all(
          n.map(async (ch: any) => {
            const { pubkey, data } = ch
            if (
              data.creator.toBase58() === wallet.value?.publicKey.toBase58()
            ) {
              const members = await loadMembers(pubkey)

              if (members.length === 0) {
                return
              }
              return members.find(m => m.data.status.__kind === 'Pending')
                ? ch
                : undefined
            }
          }),
        )
        pendingChannels.value = res.filter(c => c) as AllChannels[]

        if (pendingChannels.value.length > 0) {
          setTimeout(() => showInfo.value = true, 2000)
          setTimeout(() => showInfo.value = false, 7000)
        }
      } catch (e) {
        console.log(e)
      }
    }
  },
)
</script>

<template>
  <div
    class="panel-notifications"
    :class="{ 'has-notifications': isNotifications }"
  >
    <div class="panel-notifications__info">
      <icon-bell class="ring" :color="isNotifications ? 'FF5C5C' : 'AABEC8'" />
      <span>{{ notifications }}</span>
    </div>

    <div
      ref="notificationsInfo"
      class="panel-notifications__details"
      :style="infoWidth"
    >
      channels are awaiting user confirmation
    </div>
  </div>
</template>

<style lang='scss'>
.has-notifications {
  span {
    color: #ff5c5c;
  }

  .ring {
    animation: ring 4s 0.7s ease-in-out;
    transform-origin: 50% 4px;
  }
}

@keyframes ring {
  0% {
    transform: rotate(0);
  }
  1% {
    transform: rotate(30deg);
  }
  3% {
    transform: rotate(-28deg);
  }
  5% {
    transform: rotate(34deg);
  }
  7% {
    transform: rotate(-32deg);
  }
  9% {
    transform: rotate(30deg);
  }
  11% {
    transform: rotate(-28deg);
  }
  13% {
    transform: rotate(26deg);
  }
  15% {
    transform: rotate(-24deg);
  }
  17% {
    transform: rotate(22deg);
  }
  19% {
    transform: rotate(-20deg);
  }
  21% {
    transform: rotate(18deg);
  }
  23% {
    transform: rotate(-16deg);
  }
  25% {
    transform: rotate(14deg);
  }
  27% {
    transform: rotate(-12deg);
  }
  29% {
    transform: rotate(10deg);
  }
  31% {
    transform: rotate(-8deg);
  }
  33% {
    transform: rotate(6deg);
  }
  35% {
    transform: rotate(-4deg);
  }
  37% {
    transform: rotate(2deg);
  }
  39% {
    transform: rotate(-1deg);
  }
  41% {
    transform: rotate(1deg);
  }

  43% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(0);
  }
}
</style>
