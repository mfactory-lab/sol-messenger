import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'

export const useMobileStore = defineStore('mobile', () => {
  const { screen } = useQuasar()

  const state = reactive({
    searchOrInfo: '',
  })

  const isMobile = computed(() => screen.xs)

  watch(isMobile, (m) => {
    if (m) {
      state.searchOrInfo = 'search'
    }
  })

  return {
    state,
    isMobile,
  }
})
