import { createPinia } from 'pinia'
import type { App } from 'vue'

export function install({ app }: { app: App<Element> }) {
  const store = createPinia()
  app.use(store)
}
