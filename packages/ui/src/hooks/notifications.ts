import { useNotificationsStore } from '@/store/notifications'

export function useNotifications() {
  const { state } = useNotificationsStore()

  return {
    showDialog: computed(() => state.showDialog),
    showInfo: computed(() => state.showInfo),
    pendingChannels: computed(() => state.pendingChannels),
  }
}
