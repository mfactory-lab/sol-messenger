import { defineStore } from 'pinia'

export enum AppSize {
  FullScreen,
  Compact,
}

export const useAppSizeStore = defineStore('app-size', () => {
  const state = reactive({
    mode: AppSize[1],
    isFooter: false,
  })

  const app = document.getElementById('app') as HTMLElement

  watch(() => state.mode, () => {
    app.className = ''
    app?.classList.add(state.mode)
  })
  return {
    state,
  }
})
