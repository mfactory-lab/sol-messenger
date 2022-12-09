<script lang='ts' setup>
import type { PropType } from '@vue/runtime-core'
import { AlertTriangleIcon, CheckIcon } from 'vue-tabler-icons'

const deleteMemberProps = defineProps({
  channelEvent: Object as PropType<{
    channel: String
    address: String
    event: String
  }>,
})

const isModel = ref(false)
const event = ref<String>('')

const isDeleteEvent = computed(() => event.value === 'delete')

const modalTitle = computed(() =>
  isDeleteEvent.value
    ? 'You have been removed from the channel'
    : 'You have been authorized',
)

const modalIcon = computed(() =>
  isDeleteEvent.value ? AlertTriangleIcon : CheckIcon,
)
const modalIconColor = computed(() =>
  isDeleteEvent.value ? '#d32f2f' : '#00c853',
)

watch(
  () => deleteMemberProps.channelEvent,
  (n) => {
    if (n) {
      isModel.value = true
      event.value = n.event
    }
  },
)
</script>

<template>
  <q-dialog v-model="isModel">
    <q-card square flat class="row no-wrap items-center alert-card">
      <q-card-section class="q-pr-none event-icon">
        <component
          :is="modalIcon"
          size="80"
          :color="modalIconColor"
          class="alert-icon"
        />
      </q-card-section>
      <q-card-section class="alert-info" :class="event">
        <div class="q-pb-sm">
          <span
            class="text-blue-grey-10 text-h6 text-weight-regular alert-title"
          >{{ modalTitle }}
            <span class="text-weight-medium text-h6 text-grey-10" />
          </span>
        </div>
        <div>
          <span
            class="text-blue-grey-10 text-body2 text-weight-regular"
            name="name"
          >Channel Name:
          </span>
          <span class="text-weight-medium text-body2 text-grey-10">{{
            deleteMemberProps.channelEvent.channel
          }}</span>
        </div>
        <div>
          <span
            class="text-blue-grey-10 text-body2 text-weight-regular"
            name="name"
          >Channel Address:
          </span>
          <span
            class="text-weight-medium text-body2 text-grey-10 alert-address"
          >{{ deleteMemberProps.channelEvent.address }}</span>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.alert {
  &-card {
    min-width: 600px;
    max-width: 800px;

    @media (max-width: $breakpoint-xs) {
      min-width: 90vw;

      .alert {
        &-title {
          font-size: 20px;
        }

        &-info {
          width: 100%;
          text-align: center;
        }

        &-address {
          font-size: 11px;
        }
      }

      .delete {
        .alert-title {
          font-size: 16px;
        }
      }

      .event-icon {
        position: absolute;
        padding-left: 0;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        svg {
          width: 100%;
          opacity: 0.4;
        }
      }

      span[name="name"] {
        font-size: 16px;
      }
    }
  }
}
</style>
