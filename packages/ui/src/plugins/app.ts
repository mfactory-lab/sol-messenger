import { createHead } from '@vueuse/head'
import type { App } from 'vue'

export function install({ app }: { app: App<Element> }) {
  app.use(createHead())
}
