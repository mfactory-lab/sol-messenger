import type { QuasarPluginOptions } from 'quasar'
import { Dark, Dialog, LocalStorage, Notify, Quasar } from 'quasar'
import iconSet from 'quasar/icon-set/svg-eva-icons'
import type { App } from 'vue'

// import lang from 'quasar/lang/en-US'
// import 'quasar/src/css/index.sass';
// import '@quasar/extras/eva-icons/eva-icons.css';
// import '@quasar/extras/roboto-font/roboto-font.css';

export function install({ app }: { app: App<Element> }) {
  app.use(Quasar, {
    plugins: {
      Dark,
      Dialog,
      Notify,
      LocalStorage,
    },
    iconSet,
  } as QuasarPluginOptions)
}
