import { createHead } from '@vueuse/head'
import type { App } from 'vue'

export const install = ({ app }: { app: App<Element> }) => {
  app.use(createHead())
}
