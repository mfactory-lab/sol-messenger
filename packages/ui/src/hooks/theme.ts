import { useQuasar } from 'quasar'
import { useLocalStorage } from '@vueuse/core'

export function useDarkTheme() {
  const { dark } = useQuasar()
  const isActive = useLocalStorage<boolean>('theme-mode', dark.isActive)
  dark.set(isActive.value)

  return {
    isActive,
    set(status: boolean | 'auto') {
      dark.set(status)
      isActive.value = dark.isActive
    },
    toggle() {
      dark.toggle()
      isActive.value = dark.isActive
    },
  }
}
